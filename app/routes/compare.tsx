import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";
import Navbar from "~/components/Navbar";
import ScoreGauge from "~/components/ScoreGauge";

export const meta = () => ([
    { title: 'Resumind | Compare Resumes' },
    { name: 'description', content: 'Compare your resume analyses side by side' },
]);

const Compare = () => {
    const { auth, isLoading, kv } = usePuterStore();
    const navigate = useNavigate();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedA, setSelectedA] = useState<string>('');
    const [selectedB, setSelectedB] = useState<string>('');

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) navigate('/auth?next=/compare');
    }, [isLoading]);

    useEffect(() => {
        const load = async () => {
            const data = (await kv.list('resume:*', true)) as any[];
            if (data) {
                const parsed = data
                    .filter((r: any) => r.value && r.value !== 'undefined')
                    .map((r: any) => JSON.parse(r.value) as Resume)
                    .filter((r: Resume) => r.feedback && typeof r.feedback === 'object');
                setResumes(parsed);
                if (parsed.length >= 2) {
                    setSelectedA(parsed[0].id);
                    setSelectedB(parsed[1].id);
                }
            }
            setLoading(false);
        };
        load();
    }, []);

    const resumeA = resumes.find(r => r.id === selectedA);
    const resumeB = resumes.find(r => r.id === selectedB);

    const categories = [
        { key: 'overallScore', label: 'Overall Score' },
        { key: 'ATS', label: 'ATS Score' },
        { key: 'toneAndStyle', label: 'Tone & Style' },
        { key: 'content', label: 'Content' },
        { key: 'structure', label: 'Structure' },
        { key: 'skills', label: 'Skills' },
    ];

    const getScore = (resume: Resume, key: string): number => {
        if (key === 'overallScore') return resume.feedback.overallScore;
        return (resume.feedback[key as keyof Feedback] as any)?.score ?? 0;
    };

    const getColorClass = (score: number) =>
        score > 69 ? 'text-emerald-400' : score > 49 ? 'text-amber-400' : 'text-red-400';

    const getBarColor = (score: number) =>
        score > 69 ? 'bg-emerald-500' : score > 49 ? 'bg-amber-500' : 'bg-red-500';

    const getLabel = (resume: Resume) =>
        resume.companyName || resume.jobTitle || 'Resume';

    if (loading) {
        return (
            <main>
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-pulse text-gray-400">Loading resumes...</div>
                </div>
            </main>
        );
    }

    return (
        <main>
            <Navbar />
            <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">
                {/* Header */}
                <div className="flex items-center justify-between mb-10 animate-in fade-in duration-500">
                    <div>
                        <h1 className="text-3xl font-bold text-gradient">Compare Resumes</h1>
                        <p className="text-gray-500 mt-1 text-sm">See how your resumes stack up side by side</p>
                    </div>
                    <Link to="/" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">
                        ← Back to Home
                    </Link>
                </div>

                {resumes.length < 2 ? (
                    <div className="text-center py-20">
                        <p className="text-6xl mb-4">⚖️</p>
                        <h2 className="text-xl font-semibold text-gray-300 mb-2">Need at Least 2 Resumes</h2>
                        <p className="text-gray-500 mb-6">Upload more resumes to compare them</p>
                        <Link to="/upload" className="primary-button">Upload Resume</Link>
                    </div>
                ) : (
                    <>
                        {/* Selectors */}
                        <div className="grid grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <label htmlFor="select-a" className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Resume A</label>
                                <select
                                    id="select-a"
                                    value={selectedA}
                                    onChange={(e) => setSelectedA(e.target.value)}
                                    className="w-full bg-[#1a2035] border border-[#2d3a4f] text-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                                >
                                    {resumes.map(r => (
                                        <option key={r.id} value={r.id}>
                                            {getLabel(r)} — Score: {r.feedback.overallScore}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="select-b" className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Resume B</label>
                                <select
                                    id="select-b"
                                    value={selectedB}
                                    onChange={(e) => setSelectedB(e.target.value)}
                                    className="w-full bg-[#1a2035] border border-[#2d3a4f] text-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                                >
                                    {resumes.map(r => (
                                        <option key={r.id} value={r.id}>
                                            {getLabel(r)} — Score: {r.feedback.overallScore}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {resumeA && resumeB && (
                            <>
                                {/* Score Comparison Cards */}
                                <div className="grid grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '100ms' }}>
                                    {/* Resume A Card */}
                                    <div className="bg-[#1a2035] border border-[#2d3a4f] rounded-2xl p-6 text-center">
                                        <h3 className="text-lg font-bold text-gray-200 mb-1">{getLabel(resumeA)}</h3>
                                        <p className="text-xs text-gray-500 mb-4">{resumeA.jobTitle || ''}</p>
                                        <div className="flex justify-center mb-2">
                                            <ScoreGauge score={resumeA.feedback.overallScore} />
                                        </div>
                                    </div>

                                    {/* Resume B Card */}
                                    <div className="bg-[#1a2035] border border-[#2d3a4f] rounded-2xl p-6 text-center">
                                        <h3 className="text-lg font-bold text-gray-200 mb-1">{getLabel(resumeB)}</h3>
                                        <p className="text-xs text-gray-500 mb-4">{resumeB.jobTitle || ''}</p>
                                        <div className="flex justify-center mb-2">
                                            <ScoreGauge score={resumeB.feedback.overallScore} />
                                        </div>
                                    </div>
                                </div>

                                {/* Category-by-Category Comparison */}
                                <div className="bg-[#1a2035] border border-[#2d3a4f] rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '200ms' }}>
                                    <h3 className="text-lg font-bold text-gray-200 mb-6">Category Comparison</h3>
                                    <div className="flex flex-col gap-5">
                                        {categories.map((cat) => {
                                            const scoreA = getScore(resumeA, cat.key);
                                            const scoreB = getScore(resumeB, cat.key);
                                            const diff = scoreA - scoreB;

                                            return (
                                                <div key={cat.key}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className={`text-sm font-semibold ${getColorClass(scoreA)}`}>{scoreA}</span>
                                                        <span className="text-sm text-gray-400 font-medium">{cat.label}</span>
                                                        <span className={`text-sm font-semibold ${getColorClass(scoreB)}`}>{scoreB}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {/* Bar A (right-aligned) */}
                                                        <div className="flex-1 h-3 bg-[#2d3a4f] rounded-full overflow-hidden flex justify-end">
                                                            <div
                                                                className={`h-full ${getBarColor(scoreA)} rounded-full transition-all duration-1000`}
                                                                style={{ width: `${scoreA}%` }}
                                                            />
                                                        </div>
                                                        {/* Divider */}
                                                        <div className="w-px h-5 bg-[#2d3a4f]" />
                                                        {/* Bar B (left-aligned) */}
                                                        <div className="flex-1 h-3 bg-[#2d3a4f] rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${getBarColor(scoreB)} rounded-full transition-all duration-1000`}
                                                                style={{ width: `${scoreB}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    {/* Diff badge */}
                                                    <div className="text-center mt-1">
                                                        {diff !== 0 && (
                                                            <span className={`text-xs ${diff > 0 ? 'text-indigo-400' : 'text-pink-400'}`}>
                                                                {diff > 0 ? `← A wins by ${diff}` : `B wins by ${Math.abs(diff)} →`}
                                                            </span>
                                                        )}
                                                        {diff === 0 && <span className="text-xs text-gray-600">Tied</span>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Winner Summary */}
                                <div className="mt-6 bg-[#1a2035] border border-[#2d3a4f] rounded-2xl p-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '300ms' }}>
                                    {resumeA.feedback.overallScore > resumeB.feedback.overallScore ? (
                                        <>
                                            <p className="text-3xl mb-2">🏆</p>
                                            <h3 className="text-xl font-bold text-gray-200">
                                                <span className="text-gradient">{getLabel(resumeA)}</span> wins!
                                            </h3>
                                            <p className="text-gray-500 text-sm mt-1">
                                                Scoring {resumeA.feedback.overallScore - resumeB.feedback.overallScore} points higher overall
                                            </p>
                                        </>
                                    ) : resumeB.feedback.overallScore > resumeA.feedback.overallScore ? (
                                        <>
                                            <p className="text-3xl mb-2">🏆</p>
                                            <h3 className="text-xl font-bold text-gray-200">
                                                <span className="text-gradient">{getLabel(resumeB)}</span> wins!
                                            </h3>
                                            <p className="text-gray-500 text-sm mt-1">
                                                Scoring {resumeB.feedback.overallScore - resumeA.feedback.overallScore} points higher overall
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-3xl mb-2">🤝</p>
                                            <h3 className="text-xl font-bold text-gray-200">It's a Tie!</h3>
                                            <p className="text-gray-500 text-sm mt-1">Both resumes scored equally</p>
                                        </>
                                    )}

                                    <div className="flex items-center justify-center gap-4 mt-4">
                                        <Link to={`/resume/${resumeA.id}`} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                            View Resume A →
                                        </Link>
                                        <Link to={`/resume/${resumeB.id}`} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                            View Resume B →
                                        </Link>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </main>
    );
};

export default Compare;
