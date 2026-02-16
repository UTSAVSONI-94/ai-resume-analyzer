import { useState } from "react";

interface KeywordMatchProps {
    found: string[];
    missing: string[];
}

const KeywordMatch = ({ found, missing }: KeywordMatchProps) => {
    const total = found.length + missing.length;
    const matchRate = total > 0 ? Math.round((found.length / total) * 100) : 0;

    return (
        <div className="bg-white rounded-2xl shadow-md w-full p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <span className="text-lg">🔍</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">ATS Keyword Match</h3>
                        <p className="text-sm text-gray-500">Keywords from job description found in your resume</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className={`text-2xl font-bold ${matchRate > 70 ? 'text-green-600' : matchRate > 40 ? 'text-amber-600' : 'text-red-600'}`}>
                        {matchRate}%
                    </span>
                    <p className="text-xs text-gray-400">match rate</p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ${matchRate > 70 ? 'bg-green-500' : matchRate > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${matchRate}%` }}
                />
            </div>

            {/* Found Keywords */}
            <div className="mb-4">
                <h4 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <span>✓</span> Found ({found.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                    {found.map((keyword, i) => (
                        <span key={i} className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-medium">
                            {keyword}
                        </span>
                    ))}
                </div>
            </div>

            {/* Missing Keywords */}
            {missing.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <span>✗</span> Missing ({missing.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {missing.map((keyword, i) => (
                            <span key={i} className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-sm font-medium">
                                {keyword}
                            </span>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3 italic">
                        💡 Try adding these keywords naturally to your resume to improve your ATS score.
                    </p>
                </div>
            )}
        </div>
    );
};

export default KeywordMatch;
