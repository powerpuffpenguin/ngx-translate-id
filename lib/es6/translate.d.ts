import { Group, I18N } from './i18n';
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
    print: boolean;
    readonly languages: Array<string>;
    readonly root: Map<string, I18N | Group>;
    constructor(opts: TranslateOptions);
    object(): Record<string, any>;
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
     */
    generateAssets(dirname: string): void;
    /**
     * Pack assets
     * @param from input folder
     * @param to output folder
     */
    packAssets(from: string, to: string): void;
}
