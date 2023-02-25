import { Group, I18N } from './i18n';
export declare type Format = 'json' | 'yaml';
export interface TranslateOptions {
    /**
     * List of language resource ids to support
     *
     * @example
     * ```
     * ['en', 'zh-Hant', 'ja-JP']
     * ```
     */
    languages: Array<string>;
    root: Record<string, I18N | Group>;
}
export declare class Translate {
    test: boolean;
    print: boolean;
    readonly languages: Array<string>;
    readonly root: Map<string, I18N | Group>;
    constructor(opts: TranslateOptions);
    object(): Record<string, any>;
    private _appendNotes;
    /**
     * Generate index code
     * @param filename Generated code path
     */
    generateCode(filename: string): void;
    private _generateKey;
    /**
     * Update Language assets
     * @param dirname Language assets storage path
     * @param minimize Whether to minimize assets
     * @param format assets format
     */
    generateAssets(dirname: string, format?: Format): void;
    private _generateJSONAssets;
    private _generateJSONKeys;
    private _generateYAMLAssets;
    private _generateYAMLKeys;
    /**
     * Pack assets
     * @param from input folder
     * @param to output folder
     * @param format assets format
     */
    packAssets(from: string, to: string, format?: Format): void;
    private _packAssets;
}
