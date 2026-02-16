import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import ScoreHistory from "~/components/ScoreHistory";
import { ResumeCardSkeleton } from "~/components/Skeleton";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Resumind – AI Resume Analyzer" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) navigate('/auth?next=/');
  }, [auth.isAuthenticated])

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);

      const resumes = (await kv.list('resume:*', true)) as KVItem[];

      const parsedResumes = resumes?.map((resume) => (
        JSON.parse(resume.value) as Resume
      )).filter((r) => r.feedback && typeof r.feedback === 'object')

      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    }

    loadResumes()
  }, []);

  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar />

    {/* Hero Section */}
    <section className="main-section">
      <div className="page-heading py-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-sm font-medium text-indigo-300">AI-Powered Analysis</span>
        </div>

        <h1>Track Your Applications & Resume Ratings</h1>

        {!loadingResumes && resumes?.length === 0 ? (
          <h2 className="!text-lg !text-gray-500 max-w-2xl">
            Upload your resume and get instant AI feedback with ATS scoring, content analysis, and actionable improvement tips.
          </h2>
        ) : (
          <h2 className="!text-lg !text-gray-500 max-w-2xl">
            Review your submissions and check AI-powered feedback.
          </h2>
        )}

        {/* Stats Row */}
        <div className="flex items-center gap-8 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-gradient">{resumes.length}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Resumes</span>
          </div>
          <div className="w-px h-8 bg-[#2d3a4f]"></div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-gradient">5</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Categories</span>
          </div>
          <div className="w-px h-8 bg-[#2d3a4f]"></div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-gradient">AI</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Powered</span>
          </div>
        </div>

        {!loadingResumes && resumes?.length === 0 && (
          <div className="flex flex-col items-center gap-3 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Link to="/upload" className="primary-button w-fit text-lg font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-shadow">
              🚀 Upload Your First Resume
            </Link>
            <p className="text-xs text-gray-500">Free • No credit card required • Powered by Claude AI</p>
          </div>
        )}
      </div>
    </section>

    {/* Loading State */}
    {loadingResumes && (
      <section className="px-6 md:px-12 lg:px-16 pb-16">
        <div className="flex items-center justify-between max-w-[1850px] mx-auto mb-6">
          <div className="h-7 w-32 bg-[#2d3a4f] rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-[#2d3a4f] rounded-lg animate-pulse" />
        </div>
        <div className="resumes-section">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <ResumeCardSkeleton />
            </div>
          ))}
        </div>
      </section>
    )}

    {/* Score History Chart */}
    {!loadingResumes && resumes.length >= 2 && (
      <section className="px-6 md:px-12 lg:px-16 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="max-w-[1850px] mx-auto">
          <ScoreHistory resumes={resumes} />
        </div>
      </section>
    )}

    {/* Resume Cards Grid */}
    {!loadingResumes && resumes.length > 0 && (
      <section className="px-6 md:px-12 lg:px-16 pb-16">
        <div className="flex items-center justify-between max-w-[1850px] mx-auto mb-6">
          <h3 className="text-xl font-semibold text-gray-200">Your Resumes</h3>
          <Link to="/upload" className="primary-button w-fit text-sm font-semibold px-6 py-2.5 shadow-md hover:shadow-lg transition-shadow">
            + New Analysis
          </Link>
        </div>
        <div className="resumes-section">
          {resumes.map((resume, index) => (
            <div key={resume.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
              <ResumeCard resume={resume} onDelete={(id) => setResumes(prev => prev.filter(r => r.id !== id))} />
            </div>
          ))}
        </div>
      </section>
    )}

    {/* Footer */}
    <footer className="text-center py-8 text-xs text-gray-600">
      <p>Built with ❤️ using React Router, Puter.js & Claude AI</p>
    </footer>
  </main>
}
