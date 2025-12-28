import { NextResponse } from 'next/server';
import { fetchQiitaRss, fetchZennRss, fetchHatenaRss, fetchNoteRss } from '@/lib/fetchRss';
import { normalizeArticles } from '@/lib/normalize';
import { fetchMetadata } from '@/lib/metadata';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');

    if (!query) {
        return NextResponse.json({ articles: [] });
    }

    try {
        // 1. Fetch from all sources in parallel
        const [qiita, zenn, hatena, note] = await Promise.all([
            fetchQiitaRss(query, page),
            fetchZennRss(query, page),
            fetchHatenaRss(query, page),
            fetchNoteRss(query, page),
        ]);

        const allRawArticles = [...qiita, ...zenn, ...hatena, ...note];
        const normalized = normalizeArticles(allRawArticles, query);

        // 2. Fetch metadata (OGP, bookmarks) for top 15 results to avoid too much latency
        // Larger limit can be applied if performance allows
        const topArticles = normalized.slice(0, 15);
        const metadataList = await Promise.all(
            topArticles.map(article => fetchMetadata(article.url, article.source))
        );

        const enrichedArticles = normalized.map((article, index) => {
            if (index < metadataList.length) {
                return { ...article, ...metadataList[index] };
            }
            return article;
        });

        return NextResponse.json({ articles: enrichedArticles });
    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }
}
