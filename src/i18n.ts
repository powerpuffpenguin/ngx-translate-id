export interface I18NOptions {
    /**
     * Resource id will be automatically generated if not set
     */
    readonly id?: string | number
    /**
     * Instructions for Humans
     */
    readonly note?: string
}
/**
 * This is an item for translation
 */
export class I18N {
    readonly opts: I18NOptions
    constructor(opts?: I18NOptions) {
        this.opts = {
            id: opts?.id,
            note: opts?.note,
        }
    }
    object() {
        return this.opts
    }
}
/**
 * Create an entry for translation
 * @param id Resource id will be automatically generated if not set
 * @param note Instructions for Humans
 */
export function i18n(id?: string | number, note?: string): I18N;
/**
 * Create an entry for translation
 * @param opts @see {@link I18NOptions}
 */
export function i18n(opts?: I18NOptions): I18N;
export function i18n(...args: Array<any>): I18N {
    switch (args.length) {
        case 0:
            return new I18N()
        case 1:
            return new I18N(typeof args[0] === "string" ? {
                id: args[0],
            } : args[0])
        // case 2:
        default:
            return new I18N({
                id: args[0],
                note: args[1],
            })
    }
}
export interface GroupOptions extends I18NOptions {
    /**
     * Translation entries included in the group
     */
    readonly keys?: Record<string, I18N | Group>
}
/**
 * Used to group grouped entries
 */
export class Group {
    readonly opts: I18NOptions
    readonly keys = new Map<string, I18N | Group>
    constructor(opts?: GroupOptions) {
        this.opts = {
            id: opts?.id,
            note: opts?.note,
        }
        this.fill(opts?.keys)
    }
    set(key: string, val: I18N | Group): Group {
        this.keys.set(key, val)
        return this
    }
    get(key: string) {
        return this.keys.get(key)
    }
    fill(o?: Record<string, I18N | Group>): Group {
        if (!o) {
            return this
        }
        const keys = this.keys
        for (const key in o) {
            if (Object.prototype.hasOwnProperty.call(o, key)) {
                const val = o[key]
                if (val instanceof I18N || val instanceof Group) {
                    keys.set(key, val)
                } else {
                    throw new Error(`o[${key}] invalid: ${JSON.stringify(val)} `)
                }
            }
        }
        return this
    }
    clear() {
        this.keys.clear()
    }
    object() {
        let o: Record<string, any> = {}
        const keys = this.keys
        for (const [key, val] of keys) {
            o[key] = val.object()
        }
        return o
    }
}
export function group(opts?: Record<string, I18N | Group>): Group;
export function group(id?: string | number, opts?: Record<string, I18N | Group>): Group;
export function group(id?: string | number, note?: string, opts?: Record<string, I18N | Group>): Group;
export function group(...args: Array<any>): Group {
    switch (args.length) {
        case 0:
            return new Group()
        case 1:
            return new Group({
                keys: args[0],
            })
        case 2:
            return new Group({
                id: args[0],
                keys: args[1],
            })
        // case 3:
        default:
            return new Group({
                id: args[0],
                note: args[1],
                keys: args[2],
            })
    }
}