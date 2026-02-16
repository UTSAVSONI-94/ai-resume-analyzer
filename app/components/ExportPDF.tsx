interface ExportPDFProps {
    feedback: Feedback;
    jobTitle?: string;
    companyName?: string;
}

const ExportPDF = ({ feedback, jobTitle, companyName }: ExportPDFProps) => {

    const handleExport = () => {
        const title = companyName ? `${companyName} - ${jobTitle || 'Resume'}` : jobTitle || 'Resume Analysis';
        const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title} - Resumind Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1f2937; padding: 40px; max-width: 800px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #e5e7eb; }
        .header h1 { font-size: 28px; color: #111827; margin-bottom: 4px; }
        .header p { color: #6b7280; font-size: 14px; }
        .score-hero { text-align: center; margin: 24px 0; padding: 24px; background: linear-gradient(135deg, #eef2ff, #faf5ff); border-radius: 16px; }
        .score-hero .score { font-size: 64px; font-weight: 800; color: #4f46e5; }
        .score-hero .label { font-size: 16px; color: #6b7280; }
        .section { margin: 24px 0; }
        .section h2 { font-size: 20px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; color: #111827; }
        .category { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; margin: 8px 0; background: #f9fafb; border-radius: 8px; }
        .category .name { font-weight: 600; color: #374151; }
        .category .cat-score { font-weight: 700; }
        .good { color: #059669; }
        .warn { color: #d97706; }
        .bad { color: #dc2626; }
        .tip { padding: 10px 14px; margin: 6px 0; border-radius: 8px; font-size: 14px; }
        .tip-good { background: #ecfdf5; border-left: 3px solid #10b981; }
        .tip-improve { background: #fffbeb; border-left: 3px solid #f59e0b; }
        .tip-title { font-weight: 600; margin-bottom: 4px; }
        .keywords { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
        .keyword { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .keyword-found { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
        .keyword-missing { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
        .rewrite { border: 1px solid #e5e7eb; border-radius: 10px; margin: 10px 0; overflow: hidden; }
        .rewrite-orig { background: #fef2f2; padding: 12px 14px; font-size: 13px; color: #6b7280; text-decoration: line-through; }
        .rewrite-new { background: #ecfdf5; padding: 12px 14px; font-size: 13px; color: #111827; font-weight: 500; }
        .rewrite-reason { background: #f9fafb; padding: 8px 14px; font-size: 12px; color: #6b7280; font-style: italic; }
        .footer { text-align: center; margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; }
        @media print { body { padding: 20px; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>📄 ${title}</h1>
        <p>Resumind AI Analysis Report • ${date}</p>
    </div>

    <div class="score-hero">
        <div class="score">${feedback.overallScore}/100</div>
        <div class="label">Overall Resume Score</div>
    </div>

    <div class="section">
        <h2>📊 Category Scores</h2>
        ${[
                { name: 'ATS Compatibility', score: feedback.ATS.score },
                { name: 'Tone & Style', score: feedback.toneAndStyle.score },
                { name: 'Content', score: feedback.content.score },
                { name: 'Structure', score: feedback.structure.score },
                { name: 'Skills', score: feedback.skills.score },
            ].map(c => `
            <div class="category">
                <span class="name">${c.name}</span>
                <span class="cat-score ${c.score > 69 ? 'good' : c.score > 49 ? 'warn' : 'bad'}">${c.score}/100</span>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>🎯 ATS Tips</h2>
        ${feedback.ATS.tips.map(t => `
            <div class="tip ${t.type === 'good' ? 'tip-good' : 'tip-improve'}">
                ${t.type === 'good' ? '✅' : '⚠️'} ${t.tip}
            </div>
        `).join('')}
    </div>

    ${feedback.keywordMatch ? `
    <div class="section">
        <h2>🔍 Keyword Match</h2>
        <p style="margin-bottom: 8px; font-size: 14px; color: #6b7280;">Match rate: <strong>${Math.round((feedback.keywordMatch.found.length / (feedback.keywordMatch.found.length + feedback.keywordMatch.missing.length)) * 100)}%</strong></p>
        <p style="font-size: 13px; font-weight: 600; color: #059669; margin: 8px 0 4px;">✓ Found:</p>
        <div class="keywords">${feedback.keywordMatch.found.map(k => `<span class="keyword keyword-found">${k}</span>`).join('')}</div>
        <p style="font-size: 13px; font-weight: 600; color: #dc2626; margin: 8px 0 4px;">✗ Missing:</p>
        <div class="keywords">${feedback.keywordMatch.missing.map(k => `<span class="keyword keyword-missing">${k}</span>`).join('')}</div>
    </div>
    ` : ''}

    ${feedback.improvementSuggestions && feedback.improvementSuggestions.length > 0 ? `
    <div class="section">
        <h2>✨ AI Rewrite Suggestions</h2>
        ${feedback.improvementSuggestions.map(s => `
            <div class="rewrite">
                <div class="rewrite-orig">${s.original}</div>
                <div class="rewrite-new">${s.improved}</div>
                <div class="rewrite-reason">💡 ${s.reason}</div>
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${['toneAndStyle', 'content', 'structure', 'skills'].map(key => {
                const category = feedback[key as keyof Feedback] as { score: number; tips: { type: string; tip: string; explanation: string }[] };
                const titles: Record<string, string> = { toneAndStyle: 'Tone & Style', content: 'Content', structure: 'Structure', skills: 'Skills' };
                return `
        <div class="section">
            <h2>${titles[key]} (${category.score}/100)</h2>
            ${category.tips.map(t => `
                <div class="tip ${t.type === 'good' ? 'tip-good' : 'tip-improve'}">
                    <div class="tip-title">${t.type === 'good' ? '✅' : '⚠️'} ${t.tip}</div>
                    <div>${t.explanation}</div>
                </div>
            `).join('')}
        </div>
        `;
            }).join('')}

    <div class="footer">
        <p>Generated by Resumind • AI-Powered Resume Analyzer</p>
    </div>
</body>
</html>`;

        // Open in new window for printing/saving as PDF
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            // Auto-trigger print dialog after a small delay
            setTimeout(() => printWindow.print(), 500);
        }
    };

    return (
        <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer shadow-md hover:shadow-lg"
        >
            <span>📄</span>
            Export PDF Report
        </button>
    );
};

export default ExportPDF;
