"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Translate = void 0;
const i18n_1 = require("./i18n");
const path_1 = require("path");
const fs_1 = require("fs");
class Translate {
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
    /**
     * Generate index code
     * @param filename Generated code path
     */
    generateCode(filename) {
        const dir = (0, path_1.dirname)(filename);
        (0, fs_1.mkdirSync)(dir, {
            recursive: true,
            // mode: 0o775,
        });
        const strs = new Array();
        for (const [key, val] of this.root) {
            this._generateKey(strs, '\t', '', key, val);
        }
        const str = "export const i18n = {\n" + strs.join("\n") + "\n}";
        if (this.print) {
            console.log(str);
        }
        console.log(`code to:`, filename);
    }
    _generateKey(strs, prefix, path, key, val) {
        if (val instanceof i18n_1.I18N) {
            const notes = val.opts.note?.split('\n');
            if (notes && notes.length > 0) {
                for (const str of notes) {
                    strs.push(`${prefix}// ${str.trim()}`);
                }
            }
            const id = val.opts.id ?? key;
            strs.push(`${prefix}${key}: '${path}${id}',`);
            return;
        }
        if (val.keys.size == 0) {
            return;
        }
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
     */
    generateAssets(dirname) {
        console.log(`assets to`, dirname);
    }
    /**
     * Pack assets
     * @param from input folder
     * @param to output folder
     */
    packAssets(from, to) {
        console.log(`pack  from`, from, 'to', to);
    }
}
exports.Translate = Translate;
