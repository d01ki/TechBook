export interface Metadata {
    image?: string;
    description?: string;
    bookmarks?: number;
}

export async function fetchMetadata(url: string, source: string): Promise<Metadata> {
    const metadata: Metadata = {};

    try {
        // 1. Fetch Bookmark count from Hatena API (Corrected Endpoint)
        const bookmarkRes = await fetch(`https://bookmark.hatenaapis.com/count/entry?url=${encodeURIComponent(url)}`);
        if (bookmarkRes.ok) {
            const count = await bookmarkRes.text();
            metadata.bookmarks = parseInt(count) || 0;
        }

        // 2. Fetch OGP data with regex (to avoid cheerio dependency issues)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
        clearTimeout(timeoutId);

        if (res.ok) {
            const html = await res.text();

            // Simple regex for og:image
            const imageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
            if (imageMatch) metadata.image = imageMatch[1];

            // Simple regex for og:description
            const descMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
                html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i) ||
                html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
            if (descMatch) {
                metadata.description = descMatch[1];
                if (metadata.description.length > 100) {
                    metadata.description = metadata.description.substring(0, 100) + '...';
                }
            }
        }
    } catch (error) {
        // console.log(`Metadata fetch failed for ${url}:`, error);
    }

    return metadata;
}
