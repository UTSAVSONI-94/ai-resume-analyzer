export const extractTextFromPdf = async (file: File): Promise<string> => {
    // Dynamic import to prevent SSR issues (DOMMatrix not defined)
    const pdfjsLib = await import('pdfjs-dist');

    // Set worker source dynamically
    console.log(`[PDF] Using pdfjs-dist version: ${pdfjsLib.version}`);
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    // Iterate over all pages
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
        fullText += pageText + '\n';
    }

    return fullText;
};
