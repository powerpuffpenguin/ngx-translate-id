"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCommand = void 0;
const flags_1 = require("@king011/flags");
const path_1 = require("path");
function executeCommand(opts) {
    // console.log(opts.translate)
    // console.log(process.argv)
    new flags_1.Parser(new flags_1.Command({
        use: (0, path_1.basename)(process.argv[1]),
        short: 'ngx translate id tools',
        prepare(flags, cmd) {
            const all = flags.bool({
                name: 'all',
                short: 'a',
                default: false,
                usage: 'also specify the -c -o -d flags',
            });
            const print = flags.bool({
                name: 'print',
                short: 'p',
                default: false,
                usage: `print generate text`,
            });
            const code = flags.bool({
                name: 'code',
                short: 'c',
                default: false,
                usage: `generate code to ${opts.code}`,
            });
            const output = flags.bool({
                name: 'output',
                short: 'o',
                default: false,
                usage: `generate translators assets to ${opts.output}`,
            });
            const dist = flags.bool({
                name: 'dist',
                short: 'd',
                default: false,
                usage: `generate minimize assets to ${opts.dist}`,
            });
            const format = flags.string({
                name: 'format',
                short: 'f',
                default: "json",
                usage: `assets format [json yaml]`,
            });
            const test = flags.bool({
                name: 'test',
                short: 't',
                default: false,
                usage: `output execution to stdout but don't write to file`,
            });
            return () => {
                opts.translate.test = test.value;
                opts.translate.print = print.value;
                let i = 0;
                if (code.value || all.value) {
                    i++;
                    opts.translate.generateCode(opts.code);
                }
                if (output.value || all.value) {
                    i++;
                    opts.translate.generateAssets(opts.output, format.value);
                }
                if (dist.value || all.value) {
                    i++;
                    opts.translate.packAssets(opts.output, opts.dist, format.value);
                }
                if (i == 0) {
                    cmd.print();
                    process.exit(1);
                }
            };
        },
    })).parse(process.argv.splice(2));
}
exports.executeCommand = executeCommand;
