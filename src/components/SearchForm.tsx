'use client';

import { useState } from 'react';
import { Search, X, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchFormProps {
    onSearch: (query: string) => void;
    isLoading: boolean;
    history: string[];
    onClearHistory: () => void;
    onRemoveHistoryItem: (item: string) => void;
}

export default function SearchForm({
    onSearch,
    isLoading,
    history,
    onClearHistory,
    onRemoveHistoryItem
}: SearchFormProps) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="relative group">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="キーワードを探索..."
                        className="w-full px-8 py-5 text-lg bg-white/5 border border-white/10 rounded-[32px] focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:bg-white/[0.08] backdrop-blur-2xl text-white placeholder-white/20 transition-all duration-500 group-hover:border-white/20 shadow-2xl shadow-black/40"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="absolute right-4 p-3.5 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white transition-all duration-500 disabled:opacity-50 shadow-lg shadow-blue-600/30 active:scale-95"
                    >
                        <Search size={24} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </form>

            <AnimatePresence>
                {history.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-6"
                    >
                        <div className="flex items-center justify-between mb-3 px-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-white/30 uppercase tracking-widest">
                                <History size={14} />
                                <span>Recent Searches</span>
                            </div>
                            <button
                                onClick={onClearHistory}
                                className="text-[10px] text-white/20 hover:text-white/50 transition-colors uppercase font-bold"
                            >
                                Clear All
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {history.map((item) => (
                                <motion.div
                                    key={item}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    onClick={() => { setQuery(item); onSearch(item); }}
                                    className="group flex items-center bg-white/5 border border-white/5 rounded-2xl px-4 py-2 hover:bg-white/10 hover:border-white/10 transition-all duration-300 cursor-pointer shadow-lg active:scale-95"
                                >
                                    <span className="text-xs font-bold text-white/40 group-hover:text-blue-400 transition-colors tracking-tight">
                                        {item}
                                    </span>
                                    <X
                                        size={12}
                                        className="ml-3 text-white/10 hover:text-red-400 transition-colors pointer-events-auto"
                                        onClick={(e) => { e.stopPropagation(); onRemoveHistoryItem(item); }}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
