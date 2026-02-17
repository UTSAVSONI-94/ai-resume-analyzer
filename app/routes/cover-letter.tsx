import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";
import Navbar from "~/components/Navbar";
import { useToast } from "~/components/Toast";
import { generateCoverLetter } from "~/lib/gemini";
import { extractTextFromPdf } from "~/lib/pdf"; // We might need this if we don't have text stored

export const meta = () => ([
    { title: 'Resumind | Cover Letter Generator' },
    { name: 'description', content: 'Generate professional cover letters using AI' },
]);

const CoverLetter = () => {
    const { auth, isLoading, kv, fs } = usePuterStore();
    const navigate = useNavigate();
    const { addToast } = useToast();

    // Data State
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<string>('');
    const [loadingResumes, setLoadingResumes] = useState(true);

    // Form State
    const [jobDescription, setJobDescription] = useState('');

    // AI State
    const [isGenerating, setIsGenerating] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) navigate('/auth?next=/cover-letter');
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

    const handleGenerate = async () => {
        if (!selectedResumeId || !jobDescription) {
            addToast("Select a resume and paste a job description", "error");
            return;
        }

        setIsGenerating(true);
        setCoverLetter('');

        try {
            // 1. Get Resume Text. 
            // Ideally we should have stored the text in KV, but for now let's re-download and extract
            // or just use the JSON feedback if it has enough info? 
            // JSON feedback is structured. We need raw text for a good letter.
            // Let's try to get the file path and read it? 
            // Puter FS read might give us a blob.

            // Allow user to proceed if we can't extract text? 
            // Let's assume we can fetch the resume object.
            const resumeFn = resumes.find(r => r.id === selectedResumeId);
            if (!resumeFn) throw new Error("Resume not found");

            // Getting raw text from Puter FS for a PDF is hard client-side without re-downloading.
            // WORKAROUND: For this MVP, we will construct a "Resume Summary" from the stored JSON feedback
            // and pass THAT to Gemini. It's faster and avoids PDF parsing again.

            let resumeContext = '';
            if (resumeFn.feedback) {
                resumeContext = JSON.stringify(resumeFn.feedback, null, 2);
            } else {
                resumeContext = `Candidate for ${resumeFn.jobTitle || 'Role'} at ${resumeFn.companyName || 'Company'}. Resume text unavailable, please infer from job title.`;
                addToast("Resume not fully analyzed. Result may be generic.", "error");
            }

            // Call Gemini
            const result = await generateCoverLetter(resumeContext, jobDescription);
            setCoverLetter(result);
            addToast("Cover Letter generated!", "success");

        } catch (error) {
            console.error(error);
            addToast("Failed to generate. See console.", "error");
        } finally {
            setIsGenerating(false);
        }
    };

    const getResumeLabel = (r: Resume) => r.companyName || r.jobTitle || "Untitled Resume";

    if (loadingResumes) {
        return (
            <main>
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-pulse text-gray-400">Loading...</div>
                </div>
            </main>
        );
    }

    return (
        <main>
            <Navbar />
            <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">
                <div className="mb-10 animate-in fade-in duration-500">
                    <h1 className="text-3xl font-bold text-gradient">Cover Letter Generator ✍️</h1>
                    <p className="text-gray-500 mt-1">Create a tailored cover letter in seconds.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT: Inputs */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-[#1a2035] border border-[#2d3a4f] rounded-2xl p-6">
                            <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">1. Select Resume Source</label>
                            <select
                                className="w-full bg-[#0f172a] border border-[#2d3a4f] rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-indigo-500"
                                value={selectedResumeId}
                                onChange={(e) => setSelectedResumeId(e.target.value)}
                            >
                                {resumes.map(r => (
                                    <option key={r.id} value={r.id}>{getResumeLabel(r)}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-600 mt-2">AI will use the skills/experience from this resume.</p>
                        </div>

                        <div className="bg-[#1a2035] border border-[#2d3a4f] rounded-2xl p-6">
                            <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">2. Job Description</label>
                            <textarea
                                className="w-full h-64 bg-[#0f172a] border border-[#2d3a4f] rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                                placeholder="Paste the full job description here..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !jobDescription}
                            className={`w-full py-3 rounded-lg font-semibold transition-all ${isGenerating || !jobDescription
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:opacity-90 shadow-lg shadow-orange-500/20'
                                }`}
                        >
                            {isGenerating ? '✍️ Writing...' : '✍️ Generate Letter'}
                        </button>
                    </div>

                    {/* RIGHT: Output */}
                    <div className="lg:col-span-2">
                        <div className="bg-white text-gray-800 rounded-lg p-12 min-h-[600px] shadow-2xl">
                            {coverLetter ? (
                                <div className="animate-in fade-in duration-700">
                                    <div className="flex justify-end mb-6 no-print">
                                        <button
                                            onClick={() => { navigator.clipboard.writeText(coverLetter); addToast("Copied!", "success"); }}
                                            className="text-gray-400 hover:text-gray-900 text-sm flex items-center gap-1"
                                        >
                                            📋 Copy Text
                                        </button>
                                    </div>
                                    <div className="prose max-w-none whitespace-pre-wrap font-serif text-lg leading-relaxed">
                                        {coverLetter}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center opacity-30 select-none">
                                    <div className="text-6xl mb-4">📄</div>
                                    <p className="font-serif text-xl">Your cover letter will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CoverLetter;
