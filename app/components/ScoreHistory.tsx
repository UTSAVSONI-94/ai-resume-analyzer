import { useMemo } from "react";

interface ScoreHistoryProps {
    resumes: Resume[];
}

const ScoreHistory = ({ resumes }: ScoreHistoryProps) => {
    const chartData = useMemo(() => {
        if (resumes.length === 0) return [];
        return resumes
            .map((r) => ({
                id: r.id,
                label: r.companyName || r.jobTitle || "Resume",
                score: r.feedback.overallScore,
            }))
            .slice(-8); // Show last 8 entries
    }, [resumes]);

    if (chartData.length < 2) return null;

    const maxScore = 100;
    const chartHeight = 160;
    const chartWidth = 100; // percentage-based
    const padding = 10;

    // Calculate points for the line
    const points = chartData.map((d, i) => ({
        x: (i / (chartData.length - 1)) * (chartWidth - padding * 2) + padding,
        y: chartHeight - (d.score / maxScore) * (chartHeight - 40) - 20,
        ...d,
    }));

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

    // Average score
    const avgScore = Math.round(chartData.reduce((sum, d) => sum + d.score, 0) / chartData.length);

    // Trend
    const firstScore = chartData[0].score;
    const lastScore = chartData[chartData.length - 1].score;
    const trend = lastScore - firstScore;

    return (
        <div className="bg-[#1a2035] border border-[#2d3a4f] rounded-2xl p-6 w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-200">Score History</h3>
                    <p className="text-xs text-gray-500">Your resume scores over time</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <span className="text-2xl font-bold text-gradient">{avgScore}</span>
                        <p className="text-xs text-gray-500">avg score</p>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${trend >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        <span>{trend >= 0 ? '↑' : '↓'}</span>
                        <span>{Math.abs(trend)} pts</span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="relative w-full" style={{ height: chartHeight + 30 }}>
                <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`}
                    className="w-full h-full"
                    preserveAspectRatio="none"
                >
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map((val) => {
                        const y = chartHeight - (val / maxScore) * (chartHeight - 40) - 20;
                        return (
                            <line
                                key={val}
                                x1={padding}
                                y1={y}
                                x2={chartWidth - padding}
                                y2={y}
                                stroke="#2d3a4f"
                                strokeWidth="0.3"
                                strokeDasharray="2,2"
                            />
                        );
                    })}

                    {/* Gradient fill */}
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d={areaPath} fill="url(#chartGradient)" />

                    {/* Line */}
                    <path
                        d={linePath}
                        fill="none"
                        stroke="#818cf8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Data points */}
                    {points.map((p, i) => (
                        <g key={i}>
                            <circle cx={p.x} cy={p.y} r="2.5" fill="#818cf8" stroke="#1a2035" strokeWidth="1" />
                            {/* Score label */}
                            <text
                                x={p.x}
                                y={p.y - 6}
                                textAnchor="middle"
                                fill="#a5b4fc"
                                fontSize="4"
                                fontWeight="600"
                            >
                                {p.score}
                            </text>
                            {/* Name label */}
                            <text
                                x={p.x}
                                y={chartHeight + 12}
                                textAnchor="middle"
                                fill="#6b7280"
                                fontSize="3"
                            >
                                {p.label.length > 8 ? p.label.slice(0, 8) + '..' : p.label}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    );
};

export default ScoreHistory;
