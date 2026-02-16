import { useState } from "react";

interface Suggestion {
    original: string;
    improved: string;
    reason: string;
}

const ImprovementSuggestions = ({ suggestions }: { suggestions: Suggestion[] }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="bg-white rounded-2xl shadow-md w-full p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <span className="text-lg">✨</span>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">AI Rewrite Suggestions</h3>
                    <p className="text-sm text-gray-500">Copy-paste ready improvements for your resume</p>
                </div>
            </div>

            {/* Suggestions */}
            <div className="flex flex-col gap-5">
                {suggestions.map((suggestion, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                        {/* Original */}
                        <div className="bg-red-50/50 p-4 border-b border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">Original</span>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed line-through decoration-red-300">
                                {suggestion.original}
                            </p>
                        </div>

                        {/* Improved */}
                        <div className="bg-green-50/50 p-4">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">Improved</span>
                                <button
                                    onClick={() => handleCopy(suggestion.improved, index)}
                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer flex items-center gap-1"
                                >
                                    {copiedIndex === index ? '✓ Copied!' : '📋 Copy'}
                                </button>
                            </div>
                            <p className="text-gray-800 text-sm leading-relaxed font-medium">
                                {suggestion.improved}
                            </p>
                        </div>

                        {/* Reason */}
                        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                            <p className="text-xs text-gray-500 italic">
                                💡 {suggestion.reason}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImprovementSuggestions;
