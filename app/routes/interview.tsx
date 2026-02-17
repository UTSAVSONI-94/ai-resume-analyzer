import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Navbar from "~/components/Navbar";
import { usePuterStore } from "~/lib/puter";
import { generateInterviewQuestions } from "~/lib/gemini";
import { useToast } from "~/components/Toast";

export const meta = () => ([
    { title: 'Resumind | Mock Interview' },
    { name: 'description', content: 'AI-generated interview questions' },
]);

export default function MockInterview() {
    const { auth, kv } = usePuterStore();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    // Auth Protection
    useEffect(() => {
        if (!auth.isAuthenticated) navigate('/auth?next=/interview');
    }, [auth.isAuthenticated]);

    const [resumes, setResumes] = useState<Resume[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<string>(searchParams.get('resumeId') || '');
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [questions, setQuestions] = useState<{ question: string; context: string }[]>([]);

    // Load resumes on mount
    useEffect(() => {
        const loadResumes = async () => {
            if (!auth.user) return;
            const data = (await kv.list(`user:${auth.user.uuid}:resume:*`, true)) as any[];
            if (data) {
                const parsed = data
                    .map((r: any) => JSON.parse(r.value) as Resume);
                setResumes(parsed);

                // If no resume selected but we have some, select first
                if (!selectedResumeId && parsed.length > 0) {
                    setSelectedResumeId(parsed[0].id);
                }
            }
        };
        loadResumes();
    }, [auth.user]);

    const handleGenerate = async () => {
        if (!selectedResumeId) return;

        const resume = resumes.find(r => r.id === selectedResumeId);
        if (!resume) return;

        setGenerating(true);
        setQuestions([]);

        try {
            // We need the full text. In a real app we might store it, 
            // but here we might need to re-fetch or assume valid feedback exists.
            // For now, let's use the feedback summary as context if text isn't available,
            // OR if we stored the text (we didn't store raw text in KV, just path).
            // Retaining logic: We need to fetch the file content again or rely on what we have.
            // Actually, `generateInterviewQuestions` takes `resumeText`.
            // We need to read the file.

            // NOTE: Reading PDF again might be slow. 
            // Alternative: Use the existing feedback insights to generate questions.
            // Safely construct context even if feedback is missing/partial
            const skills = resume.feedback?.skills?.tips?.map((t: any) => t.tip).join(', ') || 'General Professional Skills';
            const score = resume.feedback?.overallScore || 'N/A';

            const contextText = `
                Role: ${resume.jobTitle || 'Candidate'}
                Company: ${resume.companyName || 'Unknown Company'}
                Skills: ${skills}
                Summary: Score ${score}
            `;

            const result = await generateInterviewQuestions(contextText);
            setQuestions(result.questions);
            addToast("Interview prepared!", "success");

        } catch (e) {
            console.error(e);
            addToast("Failed to generate questions", "error");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <main className="bg-gray-50 min-h-screen">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Mock Interview Generator 🎤</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Practice makes perfect. Generate tailored behavioral and technical questions
                        based on your specific resume profile.
                    </p>
                </div>

                {/* Controls */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Resume</label>
                        <select
                            value={selectedResumeId}
                            onChange={(e) => setSelectedResumeId(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="">-- Choose a Resume --</option>
                            {resumes.map(r => (
                                <option key={r.id} value={r.id}>
                                    {r.companyName || 'Untitled'} - {r.jobTitle || 'No Role'}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={!selectedResumeId || generating}
                        className={`px-8 py-3 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl
                            ${!selectedResumeId || generating ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
                        `}
                    >
                        {generating ? 'Generating...' : 'Start Interview'}
                    </button>
                </div>

                {/* Questions Grid */}
                {questions.length > 0 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {questions.map((q, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-100 transition-colors group">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                            {q.question}
                                        </h3>
                                        <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            💡 Context: {q.context}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!generating && questions.length === 0 && (
                    <div className="text-center py-12 opacity-50">
                        <span className="text-6xl">💭</span>
                        <p className="mt-4 text-gray-500">Select a resume to generate questions</p>
                    </div>
                )}
            </div>
        </main>
    );
}
