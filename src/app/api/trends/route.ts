import { NextResponse } from 'next/server';
import { fetchZennTrends, fetchHatenaTrends } from '@/lib/fetchRss';
import { normalizeArticles } from '@/lib/normalize';
import { fetchMetadata } from '@/lib/metadata';

export async function GET() {
    try {
        const [zennArticles, hatenaArticles] = await Promise.all([
            fetchZennTrends(),
            fetchHatenaTrends(),
        ]);

        const zennNorm = normalizeArticles(zennArticles, '');
        const hatenaNorm = normalizeArticles(hatenaArticles, '');

        // Balance changes: Take top 10 from each to ensure diversity
        // even if one source has older timestamps than the other
        const topZenn = zennNorm.slice(0, 10);
        const topHatena = hatenaNorm.slice(0, 10);

        const combined = [...topZenn, ...topHatena];

        // Enrich with metadata in parallel
        const metadataList = await Promise.all(
            combined.map(article => fetchMetadata(article.url, article.source))
        );

        const enrichedArticles = combined.map((article, index) => {
            if (index < metadataList.length) {
                return { ...article, ...metadataList[index] };
            }
            return article;
        });

        // Final sort by date
        enrichedArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

        return NextResponse.json({ articles: enrichedArticles });
    } catch (error) {
        console.error('Trends API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
