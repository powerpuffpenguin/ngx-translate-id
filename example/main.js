#!/usr/bin/env node
const { group, i18n, Translate, executeCommand } = require('../lib/es6/mod');
// Define translation details
const translate = new Translate({
    // Set the list of languages to translate
    languages: [
        'en',
        // 'zh-Hant',
    ],
    // Set translation entry
    root: {
        home: i18n(),
        about: i18n('at'),
        error: i18n('er', 'error title\n new line'),
        success: i18n({ note: 'success title' }),
        warn: i18n(null, 'warn title'),
        // Embed a group
        users: group({
            add: i18n(),
            delete: i18n('del'),
        }),
        assets: group(
            // Specify id and description for group like i18n
            'A',
            'assets group',
            {
                get: i18n(12, 'get assets'),
                post: i18n(),
                // Import content defined in other modules
                music: require('./music.js'),
                // Empty groups are ignored
                empty: group(),
            },
        ),
        // Empty groups are ignored
        empty: group(),
    },
})
// Execute commands
executeCommand({
    translate: translate,
    // Generated code paths for angular
    // `${__dirname}/src/internal/i18n.ts`
    code: `${__dirname}/i18n/src/i18n.ts`,
    // Output to this folder for translators to translate
    // Include instructions in comments and try to be human-friendly and readable
    output: `${__dirname}/i18n/translate`,
    // Angular's final packaged resource path
    // Removed instructions and created json with minimal size
    dist: `${__dirname}/i18n/dist`,
})