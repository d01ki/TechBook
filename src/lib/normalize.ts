import { RawArticle } from './fetchRss';

export interface Article {
    title: string;
    url: string;
    source: 'Qiita' | 'Zenn' | 'Hatena' | 'Note';
    publishedAt: string;
    image?: string;
    description?: string;
    bookmarks?: number;
}

export function normalizeArticles(rawArticles: RawArticle[], keyword: string): Article[] {
    const normalized = rawArticles.map(item => ({
        title: item.title || 'Untitled',
        url: item.link || '',
        source: item.source,
        publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
    }));

    // Deduplicate by URL
    const uniqueUrls = new Set<string>();
    const deduplicated = normalized.filter(article => {
        if (!article.url || uniqueUrls.has(article.url)) return false;
        uniqueUrls.add(article.url);
        return true;
    });

    // Sort by date - We remove the strict title keyword filter here
    // as the RSS feeds themselves are already targeted by tags/search.
    return deduplicated.sort((a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}
