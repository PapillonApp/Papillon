import OpenAI from 'openai';
import * as core from '@actions/core';

const MODEL = "google/gemini-2.5-flash";

export async function classifyIssueArea(title: string, body: string): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    core.warning("OPENROUTER_API_KEY is missing, skipping AI classification.");
    return null;
  }

  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
  });

  const prompt = `
You are a bot that classifies GitHub issues for the Papillon project.
Analyze the issue title and body to determine the most appropriate "area" and "type" labels.

Available Labels:
- area: backend (Services, API, connection)
- area: cache (Internal storage, database)
- area: i18n (Internationalization, translations)
- area: security (Security issues or fixes)
- area: ui (User Interface, CSS, Components)
- type: documentation (Documentation changes)
- type: performance (Performance improvements)
- type: question (Questions, requests for info)
- type: refactor (Code restructuring without new features)
- type: chores (Maintenance tasks)

Return ONLY the label name (e.g. "area: cache"). Do NOT include the description or parentheses.
If uncertain, or if no label fits well, return "null".

Title: ${title}
Body: ${body}
`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content || content.toLowerCase() === "null") return null;

    const validLabels = [
      "area: backend", "area: cache", "area: i18n", "area: security", "area: ui",
      "type: documentation", "type: performance", "type: question", "type: refactor", "type: chores"
    ];
    
    if (validLabels.includes(content.toLowerCase())) {
      return content.toLowerCase();
    }

    return null;
  } catch (error) {
    core.warning(`AI Classification failed: ${error}`);
    return null;
  }
}
