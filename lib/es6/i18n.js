"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.group = exports.Group = exports.i18n = exports.I18N = void 0;
/**
 * This is an item for translation
 */
class I18N {
    opts;
    constructor(opts) {
        this.opts = {
            id: opts?.id,
            note: opts?.note,
        };
    }
    object() {
        return this.opts;
    }
}
exports.I18N = I18N;
function i18n(...args) {
    switch (args.length) {
        case 0:
            return new I18N();
        case 1:
            return new I18N(typeof args[0] === "string" ? {
                id: args[0],
            } : args[0]);
        // case 2:
        default:
            return new I18N({
                id: args[0],
                note: args[1],
            });
    }
}
exports.i18n = i18n;
/**
 * Used to group grouped entries
 */
class Group {
    opts;
    keys = new Map;
    constructor(opts) {
        this.opts = {
            id: opts?.id,
            note: opts?.note,
        };
        this.fill(opts?.keys);
    }
    set(key, val) {
        this.keys.set(key, val);
        return this;
    }
    get(key) {
        return this.keys.get(key);
    }
    fill(o) {
        if (!o) {
            return this;
        }
        const keys = this.keys;
        for (const key in o) {
            if (Object.prototype.hasOwnProperty.call(o, key)) {
                const val = o[key];
                if (val instanceof I18N || val instanceof Group) {
                    keys.set(key, val);
                }
                else {
                    throw new Error(`o[${key}] invalid: ${JSON.stringify(val)} `);
                }
            }
        }
        return this;
    }
    clear() {
        this.keys.clear();
    }
    object() {
        let o = {};
        const keys = this.keys;
        for (const [key, val] of keys) {
            o[key] = val.object();
        }
        return o;
    }
}
exports.Group = Group;
function group(...args) {
    switch (args.length) {
        case 0:
            return new Group();
        case 1:
            return new Group({
                keys: args[0],
            });
        case 2:
            return new Group({
                id: args[0],
                keys: args[1],
            });
        // case 3:
        default:
            return new Group({
                id: args[0],
                note: args[1],
                keys: args[2],
            });
    }
}
exports.group = group;
