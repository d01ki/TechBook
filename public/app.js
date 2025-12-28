const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsSection = document.getElementById('resultsSection');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessage = document.getElementById('errorMessage');
const articlesList = document.getElementById('articlesList');
const resultCount = document.getElementById('resultCount');

// Search on button click
searchBtn.addEventListener('click', performSearch);

// Search on Enter key
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

async function performSearch() {
    const query = searchInput.value.trim();
    
    if (!query) {
        showError('検索キーワードを入力してください');
        return;
    }

    // Show loading state
    resultsSection.classList.remove('hidden');
    loadingIndicator.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    articlesList.innerHTML = '';
    resultCount.textContent = '';

    try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            throw new Error('検索に失敗しました');
        }

        const data = await response.json();
        displayResults(data.articles, query);
    } catch (error) {
        console.error('Search error:', error);
        showError('記事の取得中にエラーが発生しました。もう一度お試しください。');
    } finally {
        loadingIndicator.classList.add('hidden');
    }
}

function displayResults(articles, query) {
    if (articles.length === 0) {
        showError(`「${query}」に一致する記事が見つかりませんでした`);
        return;
    }

    resultCount.textContent = `${articles.length}件の記事が見つかりました`;

    articles.forEach(article => {
        const card = createArticleCard(article);
        articlesList.appendChild(card);
    });
}

function createArticleCard(article) {
    const card = document.createElement('div');
    card.className = 'article-card';
    card.onclick = () => window.open(article.url, '_blank');

    const sourceClass = `source-${article.source.toLowerCase()}`;
    const publishedDate = formatDate(article.publishedAt);

    card.innerHTML = `
        <div class="article-header">
            <a href="${article.url}" class="article-title" target="_blank" onclick="event.stopPropagation()">
                ${escapeHtml(article.title)}
            </a>
            <span class="article-source ${sourceClass}">${article.source}</span>
        </div>
        <div class="article-meta">
            <span class="article-author">
                👤 ${escapeHtml(article.author)}
            </span>
            <span class="article-date">
                📅 ${publishedDate}
            </span>
        </div>
        ${article.tags && article.tags.length > 0 ? `
            <div class="article-tags">
                ${article.tags.slice(0, 5).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
            </div>
        ` : ''}
    `;

    return card;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return '今日';
    } else if (diffDays === 1) {
        return '昨日';
    } else if (diffDays < 7) {
        return `${diffDays}日前`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks}週間前`;
    } else {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    articlesList.innerHTML = '';
    resultCount.textContent = '';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Focus on search input when page loads
window.addEventListener('load', () => {
    searchInput.focus();
});
