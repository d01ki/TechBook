const Parser = require('rss-parser');
const parser = new Parser();

(async () => {
    try {
        const feed = await parser.parseURL('https://qiita.com/tags/next.js/feed');
        console.log('Success:', feed.title);
    } catch (error) {
        console.error('Error:', error);
    }
})();
