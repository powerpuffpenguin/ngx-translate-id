import { Group, I18N } from './i18n';
import { dirname } from 'path';
import { mkdirSync } from 'fs';

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

    /**
     * Generate index code
     * @param filename Generated code path
     */
    generateCode(filename: string) {
        const dir = dirname(filename)
        mkdirSync(dir, {
            recursive: true,
            // mode: 0o775,
        })
        const strs = new Array<string>()
        for (const [key, val] of this.root) {
            this._generateKey(strs, '\t', '', key, val)
        }
        const str = "export const i18n = {\n" + strs.join("\n") + "\n}"
        if (this.print) {
            console.log(str)
        }
        console.log(`code to:`, filename)
    }
    private _generateKey(strs: Array<string>, prefix: string, path: string, key: string, val: I18N | Group) {
        if (val instanceof I18N) {
            const notes = val.opts.note?.split('\n')
            if (notes && notes.length > 0) {
                for (const str of notes) {
                    strs.push(`${prefix}// ${str.trim()}`)
                }
            }
            const id = val.opts.id ?? key
            strs.push(`${prefix}${key}: '${path}${id}',`)
            return
        }
        if (val.keys.size == 0) {
            return
        }
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
     */
    generateAssets(dirname: string) {

        console.log(`assets to`, dirname)
    }
    /**
     * Pack assets
     * @param from input folder 
     * @param to output folder
     */
    packAssets(from: string, to: string) {
        console.log(`pack  from`, from, 'to', to)
    }
}