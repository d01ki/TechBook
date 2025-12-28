export default function SkeletonCard() {
    return (
        <div className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md animate-pulse">
            <div className="flex justify-between items-start mb-4">
                <div className="w-16 h-5 bg-white/10 rounded-full" />
                <div className="w-5 h-5 bg-white/10 rounded-md" />
            </div>
            <div className="w-full h-10 bg-white/10 rounded-lg mb-4" />
            <div className="w-2/3 h-4 bg-white/10 rounded-md mb-6" />
            <div className="flex items-center gap-4">
                <div className="w-24 h-4 bg-white/10 rounded-md" />
                <div className="w-16 h-4 bg-white/10 rounded-md" />
            </div>
        </div>
    );
}
