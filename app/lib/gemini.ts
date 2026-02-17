import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const genAI = new GoogleGenerativeAI(API_KEY);

// Define Models (Verified Available via API List)
const MODEL_PRIMARY = "gemini-flash-latest"; // High Quota
const MODEL_SECONDARY = "gemini-pro-latest"; // High Intelligence
const MODEL_STABLE = "gemini-flash-lite-latest"; // Fallback

/**
 * PRODUCTION PATTERN: Multi-Stage Fallback Strategy (Cascading)
 * 1. Try Primary Model (1.5 Pro)
 * 2. Fallback to Fast Model (1.5 Flash)
 * 3. Fallback to Stable/Legacy Model (1.5 Flash) if all else fails.
 */
const callGeminiWithFallback = async (
    promptParts: string[],
    jsonMode: boolean = false
): Promise<string> => {
    if (!API_KEY) throw new Error("Missing Gemini API Key in .env file (VITE_GEMINI_API_KEY)");

    const config = {
        generationConfig: {
            responseMimeType: jsonMode ? "application/json" : "text/plain",
        }
    };

    // Helper to try a specific model
    const tryModel = async (modelName: string) => {
        console.log(`[Gemini] Attempting with Model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName, ...config });
        const result = await model.generateContent(promptParts);
        return result.response.text();
    };

    try {
        return await tryModel(MODEL_PRIMARY);
    } catch (primaryError: any) {
        console.warn(`[Gemini] ${MODEL_PRIMARY} failed. Switching to Secondary: ${MODEL_SECONDARY}`, primaryError.message);

        try {
            // Wait 1s before switching to avoid burst limits
            await new Promise(r => setTimeout(r, 1000));
            return await tryModel(MODEL_SECONDARY);
        } catch (secondaryError: any) {
            console.warn(`[Gemini] ${MODEL_SECONDARY} failed. Switching to Stable: ${MODEL_STABLE}`, secondaryError.message);

            try {
                // Wait 2s before final attempt
                await new Promise(r => setTimeout(r, 2000));
                return await tryModel(MODEL_STABLE);
            } catch (stableError) {
                console.error("[Gemini] All models failed.", stableError);
                throw new Error("AI Service Unavailable. Please try again later.");
            }
        }
    }
};

/**
 * Resume Analysis
 * Uses Primary/Fallback strategy with JSON enforcement.
 */
export const analyzeResumeWithGemini = async (resumeText: string, jobDescription: string = '') => {
    const systemPrompt = `
    You are a Senior Technical Recruiter at a FAANG company with 15 years of experience.
    You are critical, data-driven, and despise vague resume bullet points.
    
    Your task is to analyze the provided resume text against the job description (if provided) or general software engineering standards.
    
    RETURN ONLY JSON. DO NOT output markdown.
    
    Structure:
    {
        "overallScore": number (0-100),
        "ATS": { 
            "score": number, 
            "tips": [{ "type": "good" | "improve", "tip": "string", "explanation": "string" }] 
        },
        "content": { 
            "score": number, 
            "tips": [{ "type": "good" | "improve", "tip": "string", "explanation": "string" }] 
        },
        "structure": { 
            "score": number, 
            "tips": [{ "type": "good" | "improve", "tip": "string", "explanation": "string" }] 
        },
        "skills": { 
            "score": number, 
            "tips": [{ "type": "good" | "improve", "tip": "string", "explanation": "string" }] 
        },
        "toneAndStyle": { 
            "score": number, 
            "tips": [{ "type": "good" | "improve", "tip": "string", "explanation": "string" }] 
        },
        "keywordMatch": {
            "found": ["string"],
            "missing": ["string"]
        },
        "improvementSuggestions": [
            { "original": "string", "improved": "string", "reason": "string" }
        ]
    }
    `;

    const userPrompt = `
    RESUME CONTENT:
    ${resumeText.slice(0, 30000)}

    ${jobDescription ? `JOB DESCRIPTION:\n${jobDescription}` : 'TARGET ROLE: General Software Engineer'}
    
    Think step-by-step:
    1. Identify exact keywords from the JD (if present).
    2. Check for metrics (numbers, %, $).
    3. Evaluate formatting and readability.
    4. Provide critical feedback.
    `;

    const textResponse = await callGeminiWithFallback([systemPrompt, userPrompt], true);
    return JSON.parse(textResponse);
};

/**
 * Resume Tailoring (Rewriting)
 * Uses standard text generation.
 */
export const tailorResumeSection = async (originalText: string, jobDescription: string) => {
    const prompt = `
    Act as a Professional Resume Writer. Rewrite the following resume section to better match the Job Description.
    
    JOB DESCRIPTION KEYWORDS:
    ${jobDescription}

    ORIGINAL TEXT:
    "${originalText}"

    EXAMPLES:
    Bad: "Worked on API."
    Good: "Engineered a RESTful API serving 10k+ daily requests, optimizing latency by 40% using Redis caching."

    TASK:
    Rewrite the text to be more impactful, using active verbs and metrics. 
    Return ONLY the rewritten text.
    `;

    return await callGeminiWithFallback([prompt], false);
};

/**
 * Mock Interview Questions
 * Uses JSON enforcement.
 */
export const generateInterviewQuestions = async (resumeText: string) => {
    const prompt = `
    Based on this resume, generate 5 challenging technical interview questions that probe the candidate's WEAKEST areas or vaguely described projects.
    
    RESUME:
    ${resumeText.slice(0, 10000)}

    Return JSON:
    {
        "questions": [
            { "question": "string", "context": "string (Explanation of why this question acts as a probe)" }
        ]
    }
    `;

    const textResponse = await callGeminiWithFallback([prompt], true);
    return JSON.parse(textResponse);
};

/**
 * Cover Letter Generator
 * Generates a full cover letter based on resume and JD.
 */
export const generateCoverLetter = async (resumeText: string, jobDescription: string) => {
    const prompt = `
    Act as a professional candidate applying for a job. Write a compelling cover letter based on my resume and the job description.
    
    MY RESUME:
    ${resumeText.slice(0, 20000)}
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    REQUIREMENTS:
    - distinct paragraphs (Intro, Why Me, Closing)
    - Professional but enthusiastic tone
    - Highlight specific achievements from my resume that match the JD
    - Do not use placeholders like [Your Name], use "the candidate" if name is missing or generic.
    
    Return ONLY the cover letter text.
    `;

    return await callGeminiWithFallback([prompt], false);
};
