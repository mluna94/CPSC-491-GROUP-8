// pages/api/generateQuestion.js
// Safe server-side Next.js API route for calling OpenAI.
// Uses process.env.OPENAI_API_KEY stored in Vercel environment variables.

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed. Use POST." });
    }

    const { promptText, numQuestions = 1, difficulty = "medium" } = req.body || {};

    if (!promptText || promptText.trim().length === 0) {
      return res.status(400).json({ error: "Please provide promptText in the request body." });
    }

    // Build a clear prompt for the model
    const systemPrompt = `You are an assistant that creates multiple-choice quiz questions.`;
    const userPrompt = `Create ${numQuestions} multiple-choice question(s) about the following text. 
Difficulty: ${difficulty}.
Return JSON only in this exact structure:
{
  "questions": [
    {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "answerIndex": 0, // index 0-3 of correct option
      "explanation": "short explanation"
    }
  ]
}
Text:
"""${promptText}"""`;

    // Call OpenAI Chat Completions API
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // if unavailable in future, replace with an available chat model
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 800,
        temperature: 0.2
      })
    });

    if (!openaiRes.ok) {
      const text = await openaiRes.text();
      console.error("OpenAI error:", openaiRes.status, text);
      return res.status(502).json({ error: "OpenAI API error", details: text });
    }

    const openaiData = await openaiRes.json();
    const assistantMessage = openaiData?.choices?.[0]?.message?.content;

    // Try to parse JSON from assistant
    let parsed;
    try {
      // Model should return JSON; attempt to find JSON in the text
      const firstBrace = assistantMessage.indexOf("{");
      const jsonText = firstBrace !== -1 ? assistantMessage.slice(firstBrace) : assistantMessage;
      parsed = JSON.parse(jsonText);
    } catch (err) {
      console.error("Failed to parse JSON from OpenAI response:", assistantMessage);
      return res.status(500).json({
        error: "Failed to parse OpenAI response. See server logs.",
        raw: assistantMessage
      });
    }

    return res.status(200).json({ ok: true, data: parsed });
  } catch (err) {
    console.error("API route error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
