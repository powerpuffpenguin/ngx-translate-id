import { Group, I18N } from './i18n';
import { dirname, join } from 'path';
import { mkdirSync, writeFileSync, readFileSync } from 'fs';
import { parse as JSONParse } from 'jsonc-parser';
import { load as YAMLPArse } from 'js-yaml';

export type Format = 'json' | 'yaml'
function getString(o: any, key: string): any {
    if (typeof o === "object") {
        const v = o[key]
        if (typeof v === "string" || typeof v === "number") {
            return `${v}`
        }
    }
}
function getObject(o: any, key: string): any {
    if (typeof o === "object") {
        const v = o[key]
        if (typeof v === "object") {
            return v
        }
    }
}
export interface TranslateOptions {
    /**
     * List of language resource ids to support
     * 
     * @example
     * ```
     * ['en', 'zh-Hant', 'ja-JP']
     * ```
     */
    languages: Array<string>
    root: Record<string, I18N | Group>,
}
export class Translate {
    test = false
    print = false
    readonly languages: Array<string>
    readonly root = new Map<string, Group | I18N>()
    constructor(opts: TranslateOptions) {
        this.languages = opts.languages ?? [
            'en',
            'zh-Hant',
            'ja-JP',
        ]
        const root = this.root
        const o = opts.root
        if (typeof o !== "object") {
            throw new Error("root must be a Record<string, I18N | Group>")
        }
        for (const key in o) {
            if (Object.prototype.hasOwnProperty.call(o, key)) {
                const val = o[key]
                if (val instanceof I18N || val instanceof Group) {
                    root.set(key, val)
                } else {
                    throw new Error(`root[${key}] invalid`)
                }
            }
        }
    }
    object() {
        let o: Record<string, any> = {}
        const keys = this.root
        for (const [key, val] of keys) {
            o[key] = val.object()
        }
        return o
    }
    private _appendNotes(strs: Array<string>, prefix: string, str?: string, yaml = false) {
        const notes = str?.split('\n')
        if (notes && notes.length > 0) {
            if (yaml) {
                for (const str of notes) {
                    strs.push(`${prefix}# ${str.trim()}`)
                }
            } else {
                strs.push(`${prefix}/**`)
                for (const str of notes) {
                    strs.push(`${prefix} * ${str.trim()}`)
                }
                strs.push(`${prefix} */`)
            }
        }
    }
    /**
     * Generate index code
     * @param filename Generated code path
     */
    generateCode(filename: string) {
        const dir = dirname(filename)
        const strs = new Array<string>()
        for (const [key, val] of this.root) {
            this._generateKey(strs, '\t', '', key, val)
        }
        const str = "export const i18n = {\n" + strs.join("\n") + "\n}"
        if (this.print || this.test) {
            console.log(str)
        }
        console.log(`code to: ${filename}`)
        if (!this.test) {
            mkdirSync(dir, {
                recursive: true,
            })
            writeFileSync(filename, str)
        }
    }
    private _generateKey(strs: Array<string>, prefix: string, path: string, key: string, val: I18N | Group) {
        if (val instanceof I18N) {
            this._appendNotes(strs, prefix, val.opts.note)
            const id = val.opts.id ?? key
            strs.push(`${prefix}${key}: '${path}${id}',`)
            return
        }
        if (val.keys.size == 0) {
            return
        }
        this._appendNotes(strs, prefix, val.opts.note)

        const id = val.opts.id ?? key
        strs.push(`${prefix}${key}: {`)
        const p1 = `${prefix}\t`
        path = `${path}${id}.`
        for (const [k, v] of val.keys) {
            this._generateKey(strs, p1, path, k, v)
        }
        strs.push(`${prefix}},`)
    }
    /**
     * Update Language assets 
     * @param dirname Language assets storage path
     * @param minimize Whether to minimize assets
     * @param format assets format
     */
    generateAssets(dirname: string, format: Format = 'json') {
        switch (format) {
            case 'json':
                for (const lang of this.languages) {
                    this._generateJSONAssets(dirname, lang)
                }
                break
            case 'yaml':
                for (const lang of this.languages) {
                    this._generateYAMLAssets(dirname, lang)
                }
                break
            default:
                throw new Error(`Unsupported format ${format}`)
        }

    }
    private _generateJSONAssets(dir: string, lang: string) {
        const filename = join(dir, `${lang}.json`)
        const strs = new Array<string>()
        // 加載已翻譯內容
        let o
        try {
            o = JSONParse(readFileSync(filename, {
                encoding: "utf-8"
            }))
        } catch (e) {
            if ((e as any).code !== 'ENOENT') {
                throw e
            }
            // not found
        }
        this._generateJSONKeys(strs, "\t", this.root, o)
        const str = "{\n" + strs.join("\n") + "\n}"
        if (this.print || this.test) {
            console.log(str)
        }
        if (!this.test) {
            mkdirSync(dir, {
                recursive: true,
            })
            writeFileSync(filename, str)
        }
        console.log(`assets to: ${filename}`)
    }
    private _generateJSONKeys(strs: Array<string>, prefix: string, keys: Map<string, I18N | Group>, o: any) {
        const vals: Array<[string, I18N | Group]> = []
        for (const [k, v] of keys) {
            if (v instanceof I18N) {
                vals.push([k, v])
            } else if (v instanceof Group && v.keys.size != 0) {
                vals.push([k, v])
            }
        }
        let i = 0
        for (const [k, v] of vals) {
            i++
            if (v instanceof I18N) {
                this._appendNotes(strs, prefix, v.opts.note)
                const id = (v.opts.id ?? k).toString()
                const val = getString(o, id) ?? null
                let str = `${prefix}${JSON.stringify(id)}: ${JSON.stringify(val)}`
                if (i != vals.length) {
                    str += ","
                }
                strs.push(str)
                continue
            } else if (v instanceof Group) {
                this._appendNotes(strs, prefix, v.opts.note)
                const id = (v.opts.id ?? k).toString()
                strs.push(`${prefix}${JSON.stringify(id)}: {`)
                this._generateJSONKeys(strs, `${prefix}\t`, v.keys, getObject(o, id))
                let str = `${prefix}}`
                if (i != vals.length) {
                    str += ","
                }
                strs.push(str)
                continue
            }
            throw new Error("unknow type v ${v}")
        }
    }
    private _generateYAMLAssets(dir: string, lang: string) {
        const filename = join(dir, `${lang}.yaml`)
        const strs = new Array<string>()
        // 加載已翻譯內容
        let o
        try {
            o = YAMLPArse(readFileSync(filename, {
                encoding: "utf-8"
            }))
        } catch (e) {
            if ((e as any).code !== 'ENOENT') {
                throw e
            }
            // not found
        }

        this._generateYAMLKeys(strs, "", this.root, o)
        const str = strs.join("\n")
        if (this.print || this.test) {
            console.log(str)
        }
        if (!this.test) {
            mkdirSync(dir, {
                recursive: true,
            })
            writeFileSync(filename, str)
        }
        console.log(`assets to: ${filename}`)
    }
    private _generateYAMLKeys(strs: Array<string>, prefix: string, keys: Map<string, I18N | Group>, o: any) {
        for (const [k, v] of keys) {
            if (v instanceof I18N) {
                this._appendNotes(strs, prefix, v.opts.note, true)
                const id = (v.opts.id ?? k).toString()
                let val = getString(o, id) ?? null
                if (typeof val === "string") {
                    val = val.trim()
                    const vals = val.split("\n")
                    if (vals.length > 1) {
                        strs.push(`${prefix}${id}: |`)
                        for (const str of vals) {
                            strs.push(`${prefix}  ${str.trim()}`)
                        }
                        continue
                    }
                }
                let str = `${prefix}${id}: ${val}`
                strs.push(str)
            } else if (v instanceof Group && v.keys.size != 0) {
                this._appendNotes(strs, prefix, v.opts.note, true)
                const id = (v.opts.id ?? k).toString()
                strs.push(`${prefix}${id}:`)
                this._generateYAMLKeys(strs, `${prefix}  `, v.keys, getObject(o, id))
            }
        }
    }
    /**
     * Pack assets
     * @param from input folder 
     * @param to output folder
     * @param format assets format
     */
    packAssets(from: string, to: string, format: Format = 'json') {
        switch (format) {
            case 'json':
                for (const lang of this.languages) {
                    this._packAssets(from, to, lang)
                }
                break
            case 'yaml':
                for (const lang of this.languages) {
                    this._packAssets(from, to, lang, true)
                }
                break
            default:
                throw new Error(`Unsupported format ${format}`)
        }
    }
    private _packAssets(from: string, to: string, lang: string, yaml = false) {
        const ext = yaml ? '.yaml' : '.json'
        const src = join(from, `${lang}${ext}`)
        const dist = join(to, `${lang}.json`)

        const o = yaml ? YAMLPArse(readFileSync(src, {
            encoding: "utf-8"
        })) : JSONParse(readFileSync(src, {
            encoding: "utf-8"
        }))
        const str = JSON.stringify(o)
        if (this.print || this.test) {
            console.log(str)
        }
        if (!this.test) {
            mkdirSync(to, {
                recursive: true,
            })
            writeFileSync(dist, str)
        }
        console.log(`pack from: ${src} to ${dist}`)
    }
}