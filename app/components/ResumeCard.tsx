import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { useToast } from "~/components/Toast";

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath, resumePath }, onDelete }: { resume: Resume, onDelete: (id: string) => void }) => {
    const { fs, kv, auth } = usePuterStore();
    const { addToast } = useToast();
    const [resumeUrl, setResumeUrl] = useState('');
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const loadResume = async () => {
            try {
                const blob = await fs.read(imagePath);
                if (!blob) return;
                let url = URL.createObjectURL(blob);
                setResumeUrl(url);
            } catch (e) {
                console.warn('Failed to load resume image:', e);
            }
        }

        loadResume();
    }, [imagePath]);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm('Delete this resume analysis?')) return;

        setDeleting(true);
        // Use user-scoped key for deletion
        await kv.delete(`user:${auth.user?.uuid}:resume:${id}`);
        try { await fs.delete(resumePath); } catch (e) { /* ignore */ }
        try { await fs.delete(imagePath); } catch (e) { /* ignore */ }
        onDelete(id);
        addToast('Resume deleted successfully', 'success');
    }

    return (
        <div className="relative">
            <Link to={`/resume/${id}`} className={`resume-card animate-in fade-in duration-1000 ${deleting ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="resume-card-header">
                    <div className="flex flex-col gap-2">
                        {companyName && <h2 className="!text-gray-100 !text-xl font-bold break-words">{companyName}</h2>}
                        {jobTitle && <h3 className="text-lg break-words text-gray-400">{jobTitle}</h3>}
                        {!companyName && !jobTitle && <h2 className="!text-gray-100 !text-xl font-bold">Resume</h2>}
                    </div>
                    <div className="flex-shrink-0">
                        <ScoreCircle score={feedback.overallScore} />
                    </div>
                </div>
                {resumeUrl && (
                    <div className="gradient-border animate-in fade-in duration-1000">
                        <div className="w-full h-full">
                            <img
                                src={resumeUrl}
                                alt="resume"
                                className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
                            />
                        </div>
                    </div>
                )}
            </Link>
            <button
                onClick={handleDelete}
                disabled={deleting}
                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-md cursor-pointer z-10"
            >
                {deleting ? 'Deleting...' : 'Delete'}
            </button>
        </div>
    )
}
export default ResumeCard

