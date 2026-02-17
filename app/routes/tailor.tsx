import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";
import Navbar from "~/components/Navbar";
import { useToast } from "~/components/Toast";
import { tailorResumeSection } from "~/lib/gemini";

export const meta = () => ([
    { title: 'Resumind | Tailor Resume' },
    { name: 'description', content: 'Rewrite your resume sections to match job descriptions using AI' },
]);

const Tailor = () => {
    const { auth, isLoading, kv } = usePuterStore();
    const navigate = useNavigate();
    const { addToast } = useToast();

    // Data State
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<string>('');
    const [loadingResumes, setLoadingResumes] = useState(true);

    // Form State
    const [jobDescription, setJobDescription] = useState('');
    const [sectionToTailor, setSectionToTailor] = useState('summary'); // 'summary' | 'experience'
    const [originalText, setOriginalText] = useState('');

    // AI State
    const [isTailoring, setIsTailoring] = useState(false);
    const [rewrittenText, setRewrittenText] = useState('');

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) navigate('/auth?next=/tailor');
    }, [isLoading]);

    // Load Resumes
    useEffect(() => {
        const load = async () => {
            if (!auth.user) return;
            const data = (await kv.list(`user:${auth.user.uuid}:resume:*`, true)) as any[];
            if (data) {
                const parsed = data
                    .filter((r: any) => r.value && r.value !== 'undefined')
                    .map((r: any) => JSON.parse(r.value) as Resume);
                setResumes(parsed);
                if (parsed.length > 0) {
                    setSelectedResumeId(parsed[0].id);
                }
            }
            setLoadingResumes(false);
        };
        load();
    }, []);

    // Handle "Tailor It"
    const handleTailor = async () => {
        if (!originalText || !jobDescription) {
            addToast("Please provide original text and a job description", "error");
            return;
        }

        setIsTailoring(true);
        setRewrittenText(''); // Clear previous

        try {
            const result = await tailorResumeSection(originalText, jobDescription);
            setRewrittenText(result);
            addToast("Section rewritten successfully!", "success");
        } catch (error) {
            console.error(error);
            addToast("Failed to tailor resume. Check API Key.", "error");
        } finally {
            setIsTailoring(false);
        }
    };

    const getResumeLabel = (r: Resume) => r.companyName || r.jobTitle || "Untitled Resume";

    if (loadingResumes) {
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
                <div className="mb-10 animate-in fade-in duration-500">
                    <h1 className="text-3xl font-bold text-gradient">Resume Tailor ✂️</h1>
                    <p className="text-gray-500 mt-1">Customize your resume for specific job applications using Gemini 3.0</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: Inputs */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* 1. Select Resume */}
                        <div className="bg-[#1a2035] border border-[#2d3a4f] rounded-2xl p-6">
                            <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">1. Select Base Resume</label>
                            <select
                                className="w-full bg-[#0f172a] border border-[#2d3a4f] rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-indigo-500"
                                value={selectedResumeId}
                                onChange={(e) => setSelectedResumeId(e.target.value)}
                            >
                                {resumes.map(r => (
                                    <option key={r.id} value={r.id}>{getResumeLabel(r)}</option>
                                ))}
                            </select>
                        </div>

                        {/* 2. Paste Job Description */}
                        <div className="bg-[#1a2035] border border-[#2d3a4f] rounded-2xl p-6">
                            <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">2. Target Job Description</label>
                            <textarea
                                className="w-full h-40 bg-[#0f172a] border border-[#2d3a4f] rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                                placeholder="Paste the job description here..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                        </div>

                        {/* 3. Original Text */}
                        <div className="bg-[#1a2035] border border-[#2d3a4f] rounded-2xl p-6">
                            <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">3. Text to Rewrite</label>
                            <p className="text-xs text-gray-500 mb-2">Copy/Paste a paragraph from your resume (Summary, Experience bullet, etc.)</p>
                            <textarea
                                className="w-full h-40 bg-[#0f172a] border border-[#2d3a4f] rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                                placeholder="Paste your original summary or bullet point here..."
                                value={originalText}
                                onChange={(e) => setOriginalText(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={handleTailor}
                            disabled={isTailoring || !originalText || !jobDescription}
                            className={`w-full py-3 rounded-lg font-semibold transition-all ${isTailoring || !originalText || !jobDescription
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 shadow-lg shadow-indigo-500/20'
                                }`}
                        >
                            {isTailoring ? '✨ Tailoring with Gemini...' : '✨ Tailor My Resume'}
                        </button>
                    </div>

                    {/* RIGHT COLUMN: Results */}
                    <div className="lg:col-span-2">
                        <div className="bg-[#1a2035] border border-[#2d3a4f] rounded-2xl p-8 min-h-[600px] relative">
                            <label className="text-xs text-gray-500 uppercase tracking-wider mb-4 block">4. AI Optimized Version</label>

                            {rewrittenText ? (
                                <div className="animate-in fade-in zoom-in duration-500">
                                    <div className="bg-[#0f172a] rounded-xl p-6 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded font-medium">Gemini 3.0 Optimized</span>
                                            <button
                                                onClick={() => { navigator.clipboard.writeText(rewrittenText); addToast("Copied!", "success"); }}
                                                className="text-gray-400 hover:text-white text-sm"
                                            >
                                                📋 Copy
                                            </button>
                                        </div>
                                        <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{rewrittenText}</p>
                                    </div>

                                    <div className="mt-8">
                                        <h3 className="text-gray-400 text-sm font-medium mb-2">Why is this better?</h3>
                                        <ul className="space-y-2 text-sm text-gray-500">
                                            <li className="flex gap-2">✅ <span className="text-gray-400">Incorporates keywords</span> from the job description</li>
                                            <li className="flex gap-2">✅ <span className="text-gray-400">Uses active voice</span> ("Engineered", "Deployed" vs "Worked on")</li>
                                            <li className="flex gap-2">✅ <span className="text-gray-400">Highlights impact</span> relevant to the specific role</li>
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center pb-20 opacity-40">
                                    <div className="text-6xl mb-4">🪄</div>
                                    <h3 className="text-xl font-semibold text-gray-300">Ready to Tailor</h3>
                                    <p className="text-sm max-w-xs mt-2">Select a section and paste the JD to generate a medically precise rewrite.</p>
                                </div>
                            )}

                            {/* Background decoration */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Tailor;
