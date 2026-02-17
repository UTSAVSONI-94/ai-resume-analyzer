import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API Key found in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        console.log("Fetching available models...");
        // Hack: The SDK might not expose listModels directly on genAI instance in all versions, 
        // but let's try via the model manager if typical pattern.
        // Actually, for @google/generative-ai, we might need to use the fetch directly if SDK doesn't expose it easily,
        // BUT the error message suggested: "Call ListModels to see the list of available models".

        // Let's try a direct fetch to the API endpoint to be sure, bypassing SDK quirks.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            console.error(`Status: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error(text);
            return;
        }

        const data = await response.json();
        const models = data.models || [];

        console.log(`Found ${models.length} models:`);
        models.forEach(m => {
            if (m.supportedGenerationMethods?.includes('generateContent')) {
                console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
            }
        });

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
