const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

let genAI;

const getClient = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'placeholder') {
      throw new Error('Gemini API key not configured.');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

const buildInsightPrompt = (stats) => {
  return `You are a professional data quality analyst. Analyze the following dataset statistics and provide clear, plain-language explanations.

IMPORTANT RULES:
- Use ONLY the statistics provided below. Do NOT invent or estimate any numbers.
- Do NOT mention any column names, values, or statistics that are not in the data below.
- Write in clear, simple English. Avoid overly technical jargon.
- Be factual and concise.

DATASET STATISTICS:
${JSON.stringify(stats, null, 2)}

Provide your response as a JSON object with these exact keys:
{
  "summary": "2-3 sentence plain-language summary of the dataset and its overall quality",
  "qualityExplanation": "Explain the quality score and what each factor score means in plain language",
  "topFindings": "List the 3 most important quality findings from this dataset",
  "cleaningExplanation": "If cleaning was performed, explain what was done and what improved. If not, explain what should be cleaned."
}

Respond with ONLY the JSON object, no other text.`;
};

exports.generateInsights = async ({ datasetName, rows, columns, qualityScore, validationResult, anomalyResult }) => {
  try {
    const client = getClient();
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const stats = {
      dataset: { name: datasetName, rows, columns },
      qualityScore: {
        overall: qualityScore.overall,
        completeness: qualityScore.completeness,
        uniqueness: qualityScore.uniqueness,
        validity: qualityScore.validity,
        consistency: qualityScore.consistency,
        anomalyScore: qualityScore.anomalyScore,
      },
      validationSummary: {
        totalIssues: validationResult?.totalIssues || 0,
        topIssues: (validationResult?.checks || [])
          .filter((c) => c.status !== 'pass')
          .slice(0, 5)
          .map((c) => ({ check: c.name, severity: c.severity, detail: c.summary })),
      },
      anomalySummary: anomalyResult ? {
        method: 'Isolation Forest',
        count: anomalyResult.anomalyCount,
        percentage: anomalyResult.anomalyPercentage,
        topAffectedColumns: anomalyResult.columnScores
          ? Object.entries(anomalyResult.columnScores).slice(0, 3).map(([col]) => col)
          : [],
      } : null,
    };

    const prompt = buildInsightPrompt(stats);
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const jsonStr = text.replace(/```json\n?|```/g, '').trim();
    const insights = JSON.parse(jsonStr);

    logger.info(`AI insights generated for dataset: ${datasetName}`);
    return insights;
  } catch (err) {
    logger.error(`Gemini API error: ${err.message}`);
    return {
      summary: 'AI insights are temporarily unavailable. Please review the calculated statistics above.',
      qualityExplanation: 'Please review the individual factor scores to understand the quality rating.',
      topFindings: 'Analysis results are shown in the validation section.',
      cleaningExplanation: 'Please review the cleaning operations log for details.',
    };
  }
};
