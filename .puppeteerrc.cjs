// .puppeteerrc.cjs
/**
 * @type {import('puppeteer').Configuration}
 */
module.exports = {
    defaultBrowser: 'chrome',
    cacheDirectory: '/opt/render/.cache/puppeteer',
    browsers: [
        { name: 'chrome', revision: '140.0.7339.82' },
    ],
};
