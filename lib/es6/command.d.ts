import { Translate } from './translate';
export interface ExecuteOptions {
    translate: Translate;
    /**
     *  Generated code paths for angular
     *
    * `${__dirname}/src/internal/i18n.ts`
     */
    code: string;
    /**
     * Output to this folder for translators to translate
     *
     * Include instructions in comments and try to be human-friendly and readable
     *
     * `${__dirname}/src/internal/translate`,
     */
    output: string;
    /**
     * Angular's final packaged resource path
     *
     * Removed instructions and created json with minimal size
     *
     * `${__dirname}/src/assets/i18n`
     */
    dist: string;
}
export declare function executeCommand(opts: ExecuteOptions): void;
