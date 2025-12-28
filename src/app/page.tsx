'use client';

import { useState, useEffect, useRef } from 'react';
import SearchForm from '@/components/SearchForm';
import ArticleList from '@/components/ArticleList';
import SkeletonCard from '@/components/SkeletonCard';
import { Article } from '@/lib/normalize';
import { Sparkles, LayoutGrid, List, BookOpen, ChevronUp, Loader2, TrendingUp, Calendar, Filter } from 'lucide-react';
import { useLocalStorage } from '@/lib/hooks';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filterSource, setFilterSource] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentQuery, setCurrentQuery] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [period, setPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [isTrends, setIsTrends] = useState(true);

  const loaderRef = useRef<HTMLDivElement>(null);

  const [history, setHistory] = useLocalStorage<string[]>('searchHistory', []);
  const [readArticlesRaw, setReadArticlesRaw] = useLocalStorage<string[]>('readArticles', []);
  const [favoriteArticlesRaw, setFavoriteArticlesRaw] = useLocalStorage<string[]>('favoriteArticles', []);

  // Use Sets for faster lookup
  const readArticles = new Set(readArticlesRaw);
  const favoriteArticles = new Set(favoriteArticlesRaw);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    setIsLoading(true);
    setIsTrends(true);
    try {
      const response = await fetch('/api/trends');
      const data = await response.json();
      if (data.articles) setArticles(data.articles);
    } catch (error) {
      console.error('Trends error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && !isFetchingMore && hasMore && hasSearched) {
          handleLoadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [isLoading, isFetchingMore, hasMore, hasSearched]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = async (query: string) => {
    if (!query) return;

    setIsLoading(true);
    setHasSearched(true);
    setHasMore(true);
    setCurrentQuery(query);
    setIsTrends(false);

    // Update history
    setHistory(prev => {
      const filtered = prev.filter(h => h !== query);
      return [query, ...filtered].slice(0, 8);
    });

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=1`);
      const data = await response.json();
      if (data.articles) {
        setArticles(data.articles);
        if (data.articles.length < 10) setHasMore(false);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (isFetchingMore || !hasMore || !currentQuery) return;

    setIsFetchingMore(true);
    const nextPage = page + 1;

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(currentQuery)}&page=${nextPage}`);
      const data = await response.json();

      if (data.articles && data.articles.length > 0) {
        setArticles(prev => [...prev, ...data.articles]);
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Load more error:', error);
      setHasMore(false);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const toggleRead = (url: string) => {
    setReadArticlesRaw(prev => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return Array.from(next);
    });
  };

  const toggleFavorite = (url: string) => {
    setFavoriteArticlesRaw(prev => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return Array.from(next);
    });
  };

  const clearHistory = () => setHistory([]);
  const removeHistoryItem = (item: string) => setHistory(prev => prev.filter(h => h !== item));

  const sources = ['All', 'Qiita', 'Zenn', 'Hatena', 'Note'];
  const quickTags = ['TypeScript', 'Next.js', 'React', 'Rust', 'Go', 'AI', 'AWS'];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-mesh px-4 pt-16 md:pt-24 pb-20">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        {/* Logo & Headline */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-blue-500/20 shadow-xl shadow-blue-500/5">
            <Sparkles size={14} />
            <span>Premium Intelligence</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/20 select-none">
            TechBook
          </h1>
          <p className="text-white/40 text-lg md:text-xl max-w-xl mx-auto leading-relaxed font-medium">
            膨大な技術情報から、あなたに必要な知識を<br className="hidden md:block" />
            瞬時に、そして美しく収集します。
          </p>
        </motion.div>

        {/* Search */}
        <SearchForm
          onSearch={handleSearch}
          isLoading={isLoading}
          history={history}
          onClearHistory={clearHistory}
          onRemoveHistoryItem={removeHistoryItem}
        />

        {/* Quick Exploration Tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          {quickTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleSearch(tag)}
              className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black text-white/30 uppercase tracking-widest hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/20 transition-all duration-300"
            >
              #{tag}
            </button>
          ))}
        </motion.div>

        {/* Results Container */}
        <div className="w-full mt-24">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-6 w-full max-w-4xl mx-auto"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest animate-pulse">Analyzing Sources...</span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
              </motion.div>
            ) : (hasSearched || articles.length > 0) ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 px-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${isTrends ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {isTrends ? <TrendingUp size={24} /> : <LayoutGrid size={24} />}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white tracking-tight">
                        {isTrends ? 'Global Trends' : 'Feed Explorer'}
                      </h2>
                      <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-0.5">
                        {isTrends ? 'Hot signals from the tech community' : `${articles.length} signals detected`}
                      </p>
                    </div>
                  </div>

                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center justify-center gap-6">
                    {/* Source Filter */}
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-xl shrink-0">
                      {sources.map(source => (
                        <button
                          key={source}
                          onClick={() => setFilterSource(source)}
                          className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${filterSource === source
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                            : 'text-white/30 hover:text-white/60'
                            }`}
                        >
                          {source}
                        </button>
                      ))}
                    </div>

                    <div className="hidden lg:block h-6 w-px bg-white/10" />

                    {/* Advanced Controls */}
                    <div className="flex flex-wrap items-center gap-6">
                      {/* Sort Controls */}
                      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                        {[
                          { id: 'latest', label: 'Latest' },
                          { id: 'popular', label: 'Popular' }
                        ].map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => setSortBy(opt.id as any)}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${sortBy === opt.id
                              ? 'bg-white/20 text-white'
                              : 'text-white/20 hover:text-white/40'
                              }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      {/* Period Controls */}
                      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                        {[
                          { id: 'all', label: 'All' },
                          { id: 'today', label: '1D' },
                          { id: 'week', label: '1W' },
                          { id: 'month', label: '1M' }
                        ].map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => setPeriod(opt.id as any)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${period === opt.id
                              ? 'bg-white/20 text-white'
                              : 'text-white/20 hover:text-white/40'
                              }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter and Sort logic before passing to ArticleList */}
                <ArticleList
                  articles={articles
                    .filter(a => {
                      if (period === 'all') return true;
                      const now = new Date();
                      const pubDate = new Date(a.publishedAt);
                      const diffTime = Math.abs(now.getTime() - pubDate.getTime());
                      if (period === 'today') return diffTime <= 24 * 60 * 60 * 1000;
                      if (period === 'week') return diffTime <= 7 * 24 * 60 * 60 * 1000;
                      if (period === 'month') return diffTime <= 30 * 24 * 60 * 60 * 1000;
                      return true;
                    })
                    .sort((a, b) => {
                      if (sortBy === 'popular') return (b.bookmarks || 0) - (a.bookmarks || 0);
                      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
                    })
                  }
                  readArticles={readArticles}
                  favoriteArticles={favoriteArticles}
                  onToggleRead={toggleRead}
                  onToggleFavorite={toggleFavorite}
                  filterSource={filterSource}
                />

                {/* Infinite Scroll Sentinel */}
                <div ref={loaderRef} className="py-10 flex justify-center">
                  {isFetchingMore && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 text-blue-400 font-bold uppercase text-[10px] tracking-widest"
                    >
                      <Loader2 size={16} className="animate-spin" />
                      <span>Fetching more results...</span>
                    </motion.div>
                  )}
                  {!hasMore && articles.length > 0 && filterSource === 'All' && (
                    <span className="text-white/20 text-[10px] uppercase font-bold tracking-widest">End of signal stream</span>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="flex flex-col items-center justify-center py-20 opacity-20 grayscale pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.1 }}
              >
                <BookOpen size={80} strokeWidth={1} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Back to Top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-10 right-10 p-4 bg-blue-600 text-white rounded-2xl shadow-2xl shadow-blue-600/20 hover:bg-blue-500 transition-all border border-blue-400/20 z-50 backdrop-blur-xl"
          >
            <ChevronUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <footer className="mt-40 pt-10 border-t border-white/5 text-center">
        <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em]">
          &copy; {new Date().getFullYear()} TECHBOOK ARTIFICIAL INTELLIGENCE AGGREGATOR
        </p>
      </footer>
    </main>
  );
}
