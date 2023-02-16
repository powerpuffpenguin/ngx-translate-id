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
            return () => {
                opts.translate.print = print.value;
                let i = 0;
                if (code.value) {
                    i++;
                    opts.translate.generateCode(opts.code);
                }
                if (output.value) {
                    i++;
                    opts.translate.generateAssets(opts.output);
                }
                if (dist.value) {
                    i++;
                    opts.translate.packAssets(opts.output, opts.dist);
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
