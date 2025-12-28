import Parser from 'rss-parser';

export interface RawArticle {
    title?: string;
    link?: string;
    pubDate?: string;
    isoDate?: string;
    source: 'Qiita' | 'Zenn' | 'Hatena' | 'Note';
}

const parser = new Parser();

export async function fetchQiitaRss(keyword: string, page: number = 1): Promise<RawArticle[]> {
    if (page > 1) return []; // Qiita tags RSS doesn't support pagination easily
    try {
        const feed = await parser.parseURL(`https://qiita.com/tags/${encodeURIComponent(keyword.toLowerCase())}/feed`);
        return feed.items.map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            isoDate: item.isoDate,
            source: 'Qiita'
        }));
    } catch (error) {
        console.error('Error fetching Qiita RSS:', error);
        return [];
    }
}

export async function fetchZennRss(keyword: string, page: number = 1): Promise<RawArticle[]> {
    if (page > 1) return []; // Zenn topics RSS doesn't support pagination easily
    try {
        const feed = await parser.parseURL(`https://zenn.dev/topics/${encodeURIComponent(keyword.toLowerCase())}/feed`);
        return feed.items.map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            isoDate: item.isoDate,
            source: 'Zenn'
        }));
    } catch (error) {
        console.error('Error fetching Zenn RSS:', error);
        return [];
    }
}

export async function fetchHatenaRss(keyword: string, page: number = 1): Promise<RawArticle[]> {
    try {
        const offset = (page - 1) * 20;
        const feed = await parser.parseURL(`https://b.hatena.ne.jp/search/text?q=${encodeURIComponent(keyword)}&mode=rss&of=${offset}`);
        return feed.items.map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            isoDate: item.isoDate,
            source: 'Hatena'
        }));
    } catch (error) {
        console.error('Error fetching Hatena RSS:', error);
        return [];
    }
}

export async function fetchNoteRss(keyword: string, page: number = 1): Promise<RawArticle[]> {
    if (page > 1) return []; // Note.com hashtag RSS doesn't support pagination easily
    try {
        const feed = await parser.parseURL(`https://note.com/hashtag/${encodeURIComponent(keyword.toLowerCase())}/rss`);
        return feed.items.map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            isoDate: item.isoDate,
            source: 'Note'
        }));
    } catch (error) {
        console.error('Error fetching Note RSS:', error);
        return [];
    }
}
export async function fetchZennTrends(): Promise<RawArticle[]> {
    try {
        const feed = await parser.parseURL(`https://zenn.dev/feed`);
        return feed.items.map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            isoDate: item.isoDate,
            source: 'Zenn'
        }));
    } catch (error) {
        console.error('Error fetching Zenn trends:', error);
        return [];
    }
}

export async function fetchHatenaTrends(): Promise<RawArticle[]> {
    try {
        const feed = await parser.parseURL(`https://b.hatena.ne.jp/hotentry/it.rss`);
        return feed.items.map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            isoDate: item.isoDate,
            source: 'Hatena'
        }));
    } catch (error) {
        console.error('Error fetching Hatena trends:', error);
        return [];
    }
}
