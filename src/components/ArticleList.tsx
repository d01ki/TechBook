import { Article } from '@/lib/normalize';
import { ExternalLink, Calendar, BookOpen, Heart, CheckCircle, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

interface ArticleListProps {
    articles: Article[];
    readArticles: Set<string>;
    favoriteArticles: Set<string>;
    onToggleRead: (url: string) => void;
    onToggleFavorite: (url: string) => void;
    filterSource: string;
}

export default function ArticleList({
    articles,
    readArticles,
    favoriteArticles,
    onToggleRead,
    onToggleFavorite,
    filterSource
}: ArticleListProps) {

    const filteredArticles = filterSource === 'All'
        ? articles
        : articles.filter(a => a.source === filterSource);

    if (articles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-white/40">
                <BookOpen size={48} className="mb-4 opacity-20" />
                <p className="text-xl font-medium">記事は見つかりませんでした</p>
                <p className="text-sm mt-2 opacity-60">検索ワードを変えてお試しください</p>
            </div>
        );
    }

    if (filteredArticles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-white/40">
                <CheckCircle size={48} className="mb-4 opacity-20" />
                <p className="text-xl font-medium">{filterSource}の記事は現在ありません</p>
                <p className="text-sm mt-2 opacity-60">他のソースに切り替えるか、さらに読み込んでみてください</p>
            </div>
        );
    }

    const getSourceBadge = (source: string) => {
        const styles: Record<string, string> = {
            Qiita: "bg-[#55c500]/20 text-[#55c500] border-[#55c500]/30",
            Zenn: "bg-[#3ea8ff]/20 text-[#3ea8ff] border-[#3ea8ff]/30",
            Hatena: "bg-[#00a4de]/20 text-[#00a4de] border-[#00a4de]/30",
            Note: "bg-[#41c9b4]/20 text-[#41c9b4] border-[#41c9b4]/30"
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[source] || "bg-gray-500/20 text-white border-white/10"}`}>
                {source}
            </span>
        );
    };

    const getSourceGradient = (source: string) => {
        const gradients: Record<string, string> = {
            Qiita: "from-[#55c500]/20 to-[#55c500]/5",
            Zenn: "from-[#3ea8ff]/20 to-[#3ea8ff]/5",
            Hatena: "from-[#00a4de]/20 to-[#00a4de]/5",
            Note: "from-[#41c9b4]/20 to-[#41c9b4]/5"
        };
        return gradients[source] || "from-blue-500/20 to-purple-500/20";
    };

    return (
        <div className="w-full max-w-6xl mx-auto mt-8 pb-20 px-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
                {filteredArticles.map((article) => {
                    const isRead = readArticles.has(article.url);
                    const isFavorite = favoriteArticles.has(article.url);

                    return (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            key={article.url}
                            className={`group relative flex flex-col h-full bg-white/5 border rounded-[32px] backdrop-blur-md transition-all duration-500 cursor-pointer overflow-hidden ${isRead ? 'opacity-50 border-white/5' : 'border-white/10 hover:border-white/20 hover:bg-white/10'
                                }`}
                            onClick={() => {
                                onToggleRead(article.url);
                                window.open(article.url, '_blank');
                            }}
                        >
                            {/* OGP Image Section */}
                            {article.image ? (
                                <div className="w-full h-48 flex-shrink-0 overflow-hidden bg-white/5 relative">
                                    <img
                                        src={article.image}
                                        alt=""
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                </div>
                            ) : (
                                <div className={`w-full h-48 flex items-center justify-center bg-[#0f172a] relative overflow-hidden group-hover:bg-[#1e293b] transition-colors`}>
                                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:16px_16px]" />
                                    <img
                                        src={`https://www.google.com/s2/favicons?domain=${new URL(article.url).hostname}&sz=128`}
                                        alt={article.source}
                                        className="w-16 h-16 object-contain z-10 drop-shadow-2xl transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            <div className="flex-1 flex flex-col p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {getSourceBadge(article.source)}
                                        {article.bookmarks !== undefined && article.bookmarks > 0 && (
                                            <div className="flex items-center text-[#ff4500] text-[10px] font-black gap-1 px-2 py-0.5 rounded-full bg-[#ff4500]/10 border border-[#ff4500]/20">
                                                <MessageSquare size={10} />
                                                <span>{article.bookmarks}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => onToggleFavorite(article.url)}
                                            className={`p-1.5 rounded-xl transition-all duration-300 ${isFavorite ? 'bg-pink-500/20 text-pink-500' : 'bg-white/5 text-white/20 hover:text-white/50'}`}
                                        >
                                            <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
                                        </button>
                                        <button
                                            onClick={() => onToggleRead(article.url)}
                                            className={`p-1.5 rounded-xl transition-all duration-300 ${isRead ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-white/20 hover:text-white/50'}`}
                                        >
                                            <CheckCircle size={16} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-black transition-colors duration-300 mb-2 line-clamp-2 text-white group-hover:text-blue-400">
                                    {article.title}
                                </h3>

                                <p className="text-xs text-white/40 font-medium line-clamp-3 leading-relaxed mb-4">
                                    {article.description}
                                </p>

                                <div className="mt-auto flex items-center justify-between pt-4">
                                    <div className="flex items-center text-[10px] text-white/30 font-black uppercase tracking-widest">
                                        <Calendar size={10} className="mr-1.5" />
                                        {format(new Date(article.publishedAt), 'yyyy MM dd', { locale: ja }).replace(/ /g, '.')}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(article.url, '_blank');
                                        }}
                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-blue-600 hover:text-white transition-all text-white/20"
                                    >
                                        <ExternalLink size={12} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
