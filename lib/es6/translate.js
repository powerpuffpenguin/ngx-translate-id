"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Translate = void 0;
const i18n_1 = require("./i18n");
const path_1 = require("path");
const fs_1 = require("fs");
const jsonc_parser_1 = require("jsonc-parser");
const js_yaml_1 = require("js-yaml");
function getString(o, key) {
    if (typeof o === "object") {
        const v = o[key];
        if (typeof v === "string" || typeof v === "number") {
            return `${v}`;
        }
    }
}
function getObject(o, key) {
    if (typeof o === "object") {
        const v = o[key];
        if (typeof v === "object") {
            return v;
        }
    }
}
function stdFormat(o) {
    let i = 0;
    const dst = {};
    for (const k in o) {
        if (Object.prototype.hasOwnProperty.call(o, k)) {
            const v = o[k];
            if (v === null || v === undefined) {
                continue;
            }
            if (typeof v === "object") {
                const val = stdFormat(v);
                if (val !== null) {
                    dst[k] = val;
                    i++;
                }
            }
            else {
                i++;
                dst[k] = `${v}`;
            }
        }
    }
    return i == 0 ? null : dst;
}
class Translate {
    test = false;
    print = false;
    languages;
    root = new Map();
    constructor(opts) {
        this.languages = opts.languages ?? [
            'en',
            'zh-Hant',
            'ja-JP',
        ];
        const root = this.root;
        const o = opts.root;
        if (typeof o !== "object") {
            throw new Error("root must be a Record<string, I18N | Group>");
        }
        for (const key in o) {
            if (Object.prototype.hasOwnProperty.call(o, key)) {
                const val = o[key];
                if (val instanceof i18n_1.I18N || val instanceof i18n_1.Group) {
                    root.set(key, val);
                }
                else {
                    throw new Error(`root[${key}] invalid`);
                }
            }
        }
    }
    object() {
        let o = {};
        const keys = this.root;
        for (const [key, val] of keys) {
            o[key] = val.object();
        }
        return o;
    }
    _appendNotes(strs, prefix, str, yaml = false) {
        const notes = str?.split('\n');
        if (notes && notes.length > 0) {
            if (yaml) {
                for (const str of notes) {
                    strs.push(`${prefix}# ${str.trim()}`);
                }
            }
            else {
                strs.push(`${prefix}/**`);
                for (const str of notes) {
                    strs.push(`${prefix} * ${str.trim()}`);
                }
                strs.push(`${prefix} */`);
            }
        }
    }
    /**
     * Generate index code
     * @param filename Generated code path
     */
    generateCode(filename) {
        const dir = (0, path_1.dirname)(filename);
        const strs = new Array();
        for (const [key, val] of this.root) {
            this._generateKey(strs, '\t', '', key, val);
        }
        const str = "export const i18n = {\n" + strs.join("\n") + "\n}";
        if (this.print || this.test) {
            console.log(str);
        }
        console.log(`code to: ${filename}`);
        if (!this.test) {
            (0, fs_1.mkdirSync)(dir, {
                recursive: true,
            });
            (0, fs_1.writeFileSync)(filename, str);
        }
    }
    _generateKey(strs, prefix, path, key, val) {
        if (val instanceof i18n_1.I18N) {
            this._appendNotes(strs, prefix, val.opts.note);
            const id = val.opts.id ?? key;
            strs.push(`${prefix}${key}: '${path}${id}',`);
            return;
        }
        if (val.keys.size == 0) {
            return;
        }
        this._appendNotes(strs, prefix, val.opts.note);
        const id = val.opts.id ?? key;
        strs.push(`${prefix}${key}: {`);
        const p1 = `${prefix}\t`;
        path = `${path}${id}.`;
        for (const [k, v] of val.keys) {
            this._generateKey(strs, p1, path, k, v);
        }
        strs.push(`${prefix}},`);
    }
    /**
     * Update Language assets
     * @param dirname Language assets storage path
     * @param minimize Whether to minimize assets
     * @param format assets format
     */
    generateAssets(dirname, format = 'json') {
        switch (format) {
            case 'json':
                for (const lang of this.languages) {
                    this._generateJSONAssets(dirname, lang);
                }
                break;
            case 'yaml':
                for (const lang of this.languages) {
                    this._generateYAMLAssets(dirname, lang);
                }
                break;
            default:
                throw new Error(`Unsupported format ${format}`);
        }
    }
    _generateJSONAssets(dir, lang) {
        const filename = (0, path_1.join)(dir, `${lang}.json`);
        const strs = new Array();
        // 加載已翻譯內容
        let o;
        try {
            o = (0, jsonc_parser_1.parse)((0, fs_1.readFileSync)(filename, {
                encoding: "utf-8"
            }));
        }
        catch (e) {
            if (e.code !== 'ENOENT') {
                throw e;
            }
            // not found
        }
        this._generateJSONKeys(strs, "\t", this.root, o);
        const str = "{\n" + strs.join("\n") + "\n}";
        if (this.print || this.test) {
            console.log(str);
        }
        if (!this.test) {
            (0, fs_1.mkdirSync)(dir, {
                recursive: true,
            });
            (0, fs_1.writeFileSync)(filename, str);
        }
        console.log(`assets to: ${filename}`);
    }
    _generateJSONKeys(strs, prefix, keys, o) {
        const vals = [];
        for (const [k, v] of keys) {
            if (v instanceof i18n_1.I18N) {
                vals.push([k, v]);
            }
            else if (v instanceof i18n_1.Group && v.keys.size != 0) {
                vals.push([k, v]);
            }
        }
        let i = 0;
        for (const [k, v] of vals) {
            i++;
            if (v instanceof i18n_1.I18N) {
                this._appendNotes(strs, prefix, v.opts.note);
                const id = (v.opts.id ?? k).toString();
                const val = getString(o, id) ?? null;
                let str = `${prefix}${JSON.stringify(id)}: ${JSON.stringify(val)}`;
                if (i != vals.length) {
                    str += ",";
                }
                strs.push(str);
                continue;
            }
            else if (v instanceof i18n_1.Group) {
                this._appendNotes(strs, prefix, v.opts.note);
                const id = (v.opts.id ?? k).toString();
                strs.push(`${prefix}${JSON.stringify(id)}: {`);
                this._generateJSONKeys(strs, `${prefix}\t`, v.keys, getObject(o, id));
                let str = `${prefix}}`;
                if (i != vals.length) {
                    str += ",";
                }
                strs.push(str);
                continue;
            }
            throw new Error("unknow type v ${v}");
        }
    }
    _generateYAMLAssets(dir, lang) {
        const filename = (0, path_1.join)(dir, `${lang}.yaml`);
        const strs = new Array();
        // 加載已翻譯內容
        let o;
        try {
            o = (0, js_yaml_1.load)((0, fs_1.readFileSync)(filename, {
                encoding: "utf-8"
            }));
        }
        catch (e) {
            if (e.code !== 'ENOENT') {
                throw e;
            }
            // not found
        }
        this._generateYAMLKeys(strs, "", this.root, o);
        const str = strs.join("\n");
        if (this.print || this.test) {
            console.log(str);
        }
        if (!this.test) {
            (0, fs_1.mkdirSync)(dir, {
                recursive: true,
            });
            (0, fs_1.writeFileSync)(filename, str);
        }
        console.log(`assets to: ${filename}`);
    }
    _generateYAMLKeys(strs, prefix, keys, o) {
        for (const [k, v] of keys) {
            if (v instanceof i18n_1.I18N) {
                this._appendNotes(strs, prefix, v.opts.note, true);
                const id = (v.opts.id ?? k).toString();
                let val = getString(o, id) ?? null;
                if (typeof val === "string") {
                    val = val.trim();
                    const vals = val.split("\n");
                    if (vals.length > 1) {
                        strs.push(`${prefix}${id}: |`);
                        for (const str of vals) {
                            strs.push(`${prefix}  ${str.trim()}`);
                        }
                        continue;
                    }
                }
                let str = `${prefix}${id}: ${val}`;
                strs.push(str);
            }
            else if (v instanceof i18n_1.Group && v.keys.size != 0) {
                this._appendNotes(strs, prefix, v.opts.note, true);
                const id = (v.opts.id ?? k).toString();
                strs.push(`${prefix}${id}:`);
                this._generateYAMLKeys(strs, `${prefix}  `, v.keys, getObject(o, id));
            }
        }
    }
    /**
     * Pack assets
     * @param from input folder
     * @param to output folder
     * @param format assets format
     */
    packAssets(from, to, format = 'json') {
        switch (format) {
            case 'json':
                for (const lang of this.languages) {
                    this._packAssets(from, to, lang);
                }
                break;
            case 'yaml':
                for (const lang of this.languages) {
                    this._packAssets(from, to, lang, true);
                }
                break;
            default:
                throw new Error(`Unsupported format ${format}`);
        }
    }
    _packAssets(from, to, lang, yaml = false) {
        const ext = yaml ? '.yaml' : '.json';
        const src = (0, path_1.join)(from, `${lang}${ext}`);
        const dist = (0, path_1.join)(to, `${lang}.json`);
        const o = stdFormat(yaml ? (0, js_yaml_1.load)((0, fs_1.readFileSync)(src, {
            encoding: "utf-8"
        })) : (0, jsonc_parser_1.parse)((0, fs_1.readFileSync)(src, {
            encoding: "utf-8"
        })));
        const str = JSON.stringify(o);
        if (this.print || this.test) {
            console.log(str);
        }
        if (!this.test) {
            (0, fs_1.mkdirSync)(to, {
                recursive: true,
            });
            (0, fs_1.writeFileSync)(dist, str);
        }
        console.log(`pack from: ${src} to ${dist}`);
    }
}
exports.Translate = Translate;
