import { Command, Parser } from "@king011/flags";
import { Translate } from './translate';
import { basename } from 'path';

export interface ExecuteOptions {
    translate: Translate
    /**
     *  Generated code paths for angular
     * 
    * `${__dirname}/src/internal/i18n.ts`
     */
    code: string
    /**
     * Output to this folder for translators to translate
     * 
     * Include instructions in comments and try to be human-friendly and readable
     * 
     * `${__dirname}/src/internal/translate`,
     */
    output: string
    /**
     * Angular's final packaged resource path
     * 
     * Removed instructions and created json with minimal size
     * 
     * `${__dirname}/src/assets/i18n`
     */
    dist: string
}
export function executeCommand(opts: ExecuteOptions) {
    // console.log(opts.translate)
    // console.log(process.argv)
    new Parser(new Command({
        use: basename(process.argv[1]),
        short: 'ngx translate id tools',
        prepare(flags, cmd) {
            const print = flags.bool({
                name: 'print',
                short: 'p',
                default: false,
                usage: `print generate text`,
            })
            const code = flags.bool({
                name: 'code',
                short: 'c',
                default: false,
                usage: `generate code to ${opts.code}`,
            })
            const output = flags.bool({
                name: 'output',
                short: 'o',
                default: false,
                usage: `generate translators assets to ${opts.output}`,
            })
            const dist = flags.bool({
                name: 'dist',
                short: 'd',
                default: false,
                usage: `generate minimize assets to ${opts.dist}`,
            })
            return () => {
                opts.translate.print = print.value
                let i = 0
                if (code.value) {
                    i++
                    opts.translate.generateCode(opts.code)
                }
                if (output.value) {
                    i++
                    opts.translate.generateAssets(opts.output)
                }
                if (dist.value) {
                    i++
                    opts.translate.packAssets(opts.output, opts.dist)
                }

                if (i == 0) {
                    cmd.print()
                    process.exit(1)
                }
            }
        },
    })).parse(process.argv.splice(2));
}