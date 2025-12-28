import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import Parser from 'rss-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const parser = new Parser();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Search articles from multiple sources
app.get('/api/search', async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const results = await Promise.allSettled([
      searchQiita(query),
      searchZenn(query),
      searchHatena(query)
    ]);

    const articles = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        articles.push(...result.value);
      } else {
        console.error(`Error from source ${index}:`, result.reason);
      }
    });

    // Sort by date (newest first)
    articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    res.json({ articles, total: articles.length });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Search Qiita articles
async function searchQiita(query) {
  try {
    const response = await fetch(
      `https://qiita.com/api/v2/items?query=${encodeURIComponent(query)}&per_page=20`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Qiita API error: ${response.status}`);
    }

    const items = await response.json();
    
    return items.map(item => ({
      title: item.title,
      url: item.url,
      publishedAt: item.created_at,
      author: item.user.name || item.user.id,
      source: 'Qiita',
      tags: item.tags.map(tag => tag.name)
    }));
  } catch (error) {
    console.error('Qiita search error:', error);
    return [];
  }
}

// Search Zenn articles
async function searchZenn(query) {
  try {
    const response = await fetch(
      `https://zenn.dev/api/search?q=${encodeURIComponent(query)}&source=articles&order=latest`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Zenn API error: ${response.status}`);
    }

    const data = await response.json();
    
    return (data.articles || []).slice(0, 20).map(article => ({
      title: article.title,
      url: `https://zenn.dev${article.path}`,
      publishedAt: article.published_at,
      author: article.user?.name || article.user?.username || 'Unknown',
      source: 'Zenn',
      tags: []
    }));
  } catch (error) {
    console.error('Zenn search error:', error);
    return [];
  }
}

// Search Hatena Blog articles via RSS
async function searchHatena(query) {
  try {
    // Using Hatena Bookmark's hot entry feed
    const feed = await parser.parseURL('https://b.hatena.ne.jp/hotentry/it.rss');
    
    const articles = feed.items
      .filter(item => {
        const title = item.title?.toLowerCase() || '';
        const content = item.contentSnippet?.toLowerCase() || '';
        const searchQuery = query.toLowerCase();
        return title.includes(searchQuery) || content.includes(searchQuery);
      })
      .slice(0, 20)
      .map(item => ({
        title: item.title,
        url: item.link,
        publishedAt: item.pubDate || item.isoDate,
        author: 'Hatena User',
        source: 'Hatena',
        tags: []
      }));

    return articles;
  } catch (error) {
    console.error('Hatena search error:', error);
    return [];
  }
}

app.listen(PORT, () => {
  console.log(`TechBook server is running on http://localhost:${PORT}`);
});
