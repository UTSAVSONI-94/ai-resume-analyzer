import { type FormEvent, useState } from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { useToast } from "~/components/Toast";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../constants";
import { analyzeResumeWithGemini } from "~/lib/gemini";
import { extractTextFromPdf } from "~/lib/pdf";

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File }) => {
        setIsProcessing(true);

        setStatusText('Uploading the file...');
        const uploadedFile = await fs.upload([file]);
        if (!uploadedFile) {
            addToast('Failed to upload file', 'error');
            return setStatusText('Error: Failed to upload file');
        }

        setStatusText('Converting to image...');
        const imageFile = await convertPdfToImage(file);
        if (!imageFile.file) return setStatusText('Error: Failed to convert PDF to image');

        setStatusText('Uploading the image...');
        const uploadedImage = await fs.upload([imageFile.file]);
        if (!uploadedImage) return setStatusText('Error: Failed to upload image');

        setStatusText('Preparing data...');
        const uuid = generateUUID();
        const data = {
            id: uuid,
            userId: auth.user?.uuid, // Store user UUID
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            companyName, jobTitle, jobDescription,
            feedback: '',
        }

        // Extract text from PDF
        setStatusText('Extracting text from PDF...');
        let text = '';
        try {
            text = await extractTextFromPdf(file);
        } catch (e) {
            console.error(e);
            return setStatusText('Error: Failed to read PDF text. Is it a scanned image?');
        }

        setStatusText('Analyzing with Gemini 1.5...');

        let feedback;
        try {
            feedback = await analyzeResumeWithGemini(text, jobDescription);
        } catch (err: any) {
            console.error(err);
            if (err.message?.includes('API Key')) {
                addToast("Missing Gemini API Key! Check .env", "error");
                return setStatusText('Error: Missing Gemini API Key');
            }
            return setStatusText('Error: AI Analysis Failed');
        }

        data.feedback = feedback;
        // Use user-scoped key: user:{uuid}:resume:{uuid}
        await kv.set(`user:${auth.user?.uuid}:resume:${uuid}`, JSON.stringify(data));
        setStatusText('Analysis complete, redirecting...');
        addToast('Resume analyzed successfully!', 'success');
        console.log(data);
        navigate(`/resume/${uuid}`);
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if (!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if (!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" />
                        </>
                    ) : (
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )}
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
                            </div>

                            <div className="form-div">
                                <label>Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button className="primary-button" type="submit">
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    )
}
export default Upload
