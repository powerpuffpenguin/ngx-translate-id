const { group, i18n } = require('../lib/es6/mod');
module.exports = group({
    play: i18n(),
    stop: i18n(undefined, 'stop tooltip'),
})
