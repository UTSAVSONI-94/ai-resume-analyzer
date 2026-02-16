import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";
import Navbar from "~/components/Navbar";
import { DashboardSkeleton } from "~/components/Skeleton";

export const meta = () => ([
    { title: 'Resumind | Dashboard' },
    { name: 'description', content: 'Your resume analytics and insights' },
]);

const Dashboard = () => {
    const { auth, isLoading, kv } = usePuterStore();
    const navigate = useNavigate();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) navigate('/auth?next=/dashboard');
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
            }
            setLoading(false);
        };
        load();
    }, []);

    if (loading) {
        return (
            <main>
                <Navbar />
                <DashboardSkeleton />
            </main>
        );
    }

    // Analytics calculations
    const totalResumes = resumes.length;
    const avgOverall = totalResumes > 0 ? Math.round(resumes.reduce((s, r) => s + r.feedback.overallScore, 0) / totalResumes) : 0;
    const avgATS = totalResumes > 0 ? Math.round(resumes.reduce((s, r) => s + r.feedback.ATS.score, 0) / totalResumes) : 0;
    const bestScore = totalResumes > 0 ? Math.max(...resumes.map(r => r.feedback.overallScore)) : 0;
    const worstScore = totalResumes > 0 ? Math.min(...resumes.map(r => r.feedback.overallScore)) : 0;

    const categories = ['toneAndStyle', 'content', 'structure', 'skills'] as const;
    const categoryLabels: Record<string, string> = {
        toneAndStyle: 'Tone & Style',
        content: 'Content',
        structure: 'Structure',
        skills: 'Skills',
    };
    const categoryAvgs = categories.map(cat => ({
        name: categoryLabels[cat],
        avg: totalResumes > 0 ? Math.round(resumes.reduce((s, r) => s + (r.feedback[cat] as any).score, 0) / totalResumes) : 0,
    }));

    // Score distribution
    const distribution = [
        { label: '90-100', count: resumes.filter(r => r.feedback.overallScore >= 90).length, color: 'bg-emerald-500' },
        { label: '70-89', count: resumes.filter(r => r.feedback.overallScore >= 70 && r.feedback.overallScore < 90).length, color: 'bg-green-500' },
        { label: '50-69', count: resumes.filter(r => r.feedback.overallScore >= 50 && r.feedback.overallScore < 70).length, color: 'bg-amber-500' },
        { label: '30-49', count: resumes.filter(r => r.feedback.overallScore >= 30 && r.feedback.overallScore < 50).length, color: 'bg-orange-500' },
        { label: '0-29', count: resumes.filter(r => r.feedback.overallScore < 30).length, color: 'bg-red-500' },
    ];
    const maxDistCount = Math.max(...distribution.map(d => d.count), 1);

    // Companies
    const companies = [...new Set(resumes.map(r => r.companyName).filter(Boolean))];

    return (
        <main>
            <Navbar />
            <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">
                {/* Header */}
                <div className="flex items-center justify-between mb-10 animate-in fade-in duration-500">
                    <div>
                        <h1 className="text-3xl font-bold text-gradient">Analytics Dashboard</h1>
                        <p className="text-gray-500 mt-1 text-sm">Track your resume performance over time</p>
                    </div>
                    <Link to="/" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">
                        ← Back to Home
                    </Link>
                </div>

                {totalResumes === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-6xl mb-4">📊</p>
                        <h2 className="text-xl font-semibold text-gray-300 mb-2">No Data Yet</h2>
                        <p className="text-gray-500 mb-6">Upload your first resume to see analytics</p>
                        <Link to="/upload" className="primary-button">Upload Resume</Link>
                    </div>
                ) : (
                    <>
                        {/* Stat Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {[
                                { label: 'Total Resumes', value: totalResumes, icon: '📄', color: 'from-indigo-500/20 to-indigo-500/5' },
                                { label: 'Avg Score', value: `${avgOverall}/100`, icon: '📊', color: 'from-purple-500/20 to-purple-500/5' },
                                { label: 'Best Score', value: `${bestScore}/100`, icon: '🏆', color: 'from-emerald-500/20 to-emerald-500/5' },
                                { label: 'Avg ATS', value: `${avgATS}/100`, icon: '🎯', color: 'from-amber-500/20 to-amber-500/5' },
                            ].map((stat, i) => (
                                <div key={i} className={`bg-gradient-to-br ${stat.color} bg-[#1a2035] border border-[#2d3a4f] rounded-xl p-5`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">{stat.icon}</span>
                                        <span className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-200">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Category Breakdown & Score Distribution */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '100ms' }}>
                            {/* Category Averages */}
                            <div className="bg-[#1a2035] border border-[#2d3a4f] rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-gray-200 mb-5">Category Breakdown</h3>
                                <div className="flex flex-col gap-4">
                                    {categoryAvgs.map((cat, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-400">{cat.name}</span>
                                                <span className={`font-semibold ${cat.avg > 69 ? 'text-emerald-400' : cat.avg > 49 ? 'text-amber-400' : 'text-red-400'}`}>
                                                    {cat.avg}/100
                                                </span>
                                            </div>
                                            <div className="w-full h-2 bg-[#2d3a4f] rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${cat.avg > 69 ? 'bg-emerald-500' : cat.avg > 49 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                    style={{ width: `${cat.avg}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {/* ATS */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-400">ATS Compatibility</span>
                                            <span className={`font-semibold ${avgATS > 69 ? 'text-emerald-400' : avgATS > 49 ? 'text-amber-400' : 'text-red-400'}`}>
                                                {avgATS}/100
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-[#2d3a4f] rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${avgATS > 69 ? 'bg-emerald-500' : avgATS > 49 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                style={{ width: `${avgATS}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Score Distribution */}
                            <div className="bg-[#1a2035] border border-[#2d3a4f] rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-gray-200 mb-5">Score Distribution</h3>
                                <div className="flex flex-col gap-3">
                                    {distribution.map((d, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <span className="text-xs text-gray-500 w-12 text-right font-mono">{d.label}</span>
                                            <div className="flex-1 h-6 bg-[#2d3a4f] rounded-md overflow-hidden">
                                                <div
                                                    className={`h-full ${d.color} rounded-md transition-all duration-1000 flex items-center justify-end pr-2`}
                                                    style={{ width: `${(d.count / maxDistCount) * 100}%`, minWidth: d.count > 0 ? '28px' : '0' }}
                                                >
                                                    {d.count > 0 && <span className="text-xs font-bold text-white">{d.count}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Resumes Table */}
                        <div className="bg-[#1a2035] border border-[#2d3a4f] rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '200ms' }}>
                            <h3 className="text-lg font-bold text-gray-200 mb-5">Recent Analyses</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[#2d3a4f]">
                                            <th className="text-left py-3 px-2 text-gray-500 font-medium">Company</th>
                                            <th className="text-left py-3 px-2 text-gray-500 font-medium">Job Title</th>
                                            <th className="text-center py-3 px-2 text-gray-500 font-medium">Score</th>
                                            <th className="text-center py-3 px-2 text-gray-500 font-medium">ATS</th>
                                            <th className="text-right py-3 px-2 text-gray-500 font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resumes.slice(0, 10).map((r, i) => (
                                            <tr key={i} className="border-b border-[#2d3a4f]/50 hover:bg-[#2d3a4f]/30 transition-colors">
                                                <td className="py-3 px-2 text-gray-300">{r.companyName || '—'}</td>
                                                <td className="py-3 px-2 text-gray-400">{r.jobTitle || '—'}</td>
                                                <td className="py-3 px-2 text-center">
                                                    <span className={`font-semibold ${r.feedback.overallScore > 69 ? 'text-emerald-400' : r.feedback.overallScore > 49 ? 'text-amber-400' : 'text-red-400'}`}>
                                                        {r.feedback.overallScore}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-2 text-center text-gray-400">{r.feedback.ATS.score}</td>
                                                <td className="py-3 px-2 text-right">
                                                    <Link to={`/resume/${r.id}`} className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors">
                                                        View →
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Companies applied to */}
                        {companies.length > 0 && (
                            <div className="mt-6 bg-[#1a2035] border border-[#2d3a4f] rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '300ms' }}>
                                <h3 className="text-lg font-bold text-gray-200 mb-4">Companies Targeted</h3>
                                <div className="flex flex-wrap gap-2">
                                    {companies.map((c, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-[#2d3a4f] text-gray-300 rounded-full text-sm font-medium">
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
};

export default Dashboard;
