export declare type NoteType = string | number | Array<string | number>;
export interface I18NOptions {
    /**
     * Resource id will be automatically generated if not set
     */
    readonly id?: string | number;
    /**
     * Instructions for Humans
     */
    readonly note?: NoteType;
}
/**
 * This is an item for translation
 */
export declare class I18N {
    readonly opts: I18NOptions;
    constructor(opts?: I18NOptions);
    object(): I18NOptions;
}
/**
 * Create an entry for translation
 * @param id Resource id will be automatically generated if not set
 * @param note Instructions for Humans
 */
export declare function i18n(id?: string | number, note?: NoteType): I18N;
/**
 * Create an entry for translation
 * @param opts @see {@link I18NOptions}
 */
export declare function i18n(opts?: I18NOptions): I18N;
export interface GroupOptions extends I18NOptions {
    /**
     * Translation entries included in the group
     */
    readonly keys?: Record<string, I18N | Group>;
}
/**
 * Used to group grouped entries
 */
export declare class Group {
    readonly opts: I18NOptions;
    readonly keys: Map<string, I18N | Group>;
    constructor(opts?: GroupOptions);
    set(key: string, val: I18N | Group): Group;
    get(key: string): I18N | Group | undefined;
    fill(o?: Record<string, I18N | Group>): Group;
    clear(): void;
    object(): Record<string, any>;
}
export declare function group(opts?: Record<string, I18N | Group>): Group;
export declare function group(id?: string | number, opts?: Record<string, I18N | Group>): Group;
export declare function group(id?: string | number, note?: NoteType, opts?: Record<string, I18N | Group>): Group;
