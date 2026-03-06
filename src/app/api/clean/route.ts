import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter, parseGeneratedEntries } from "@/lib/openrouter";

export async function POST(request: NextRequest) {
  try {
    const { rawContent, categoryName } = await request.json();

    if (!rawContent?.trim()) {
      return NextResponse.json({ error: "No content provided" }, { status: 400 });
    }

    const systemPrompt = `You are a learning content organizer. The user will paste raw, unformatted learning content (questions, notes, Q&A, etc.) for the category "${categoryName}".

Your job is to:
1. Parse the raw text into individual learning items
2. Clean up formatting, fix grammar, structure content properly
3. Separate questions from answers where possible
4. Return a well-structured JSON array

Return a JSON array of objects with this exact structure:
[
  {
    "title": "Brief descriptive title for this item",
    "content": "The question, concept, or main content (supports markdown)",
    "answer": "The answer, explanation, or definition (supports markdown)"
  }
]

Rules:
- Return ONLY the JSON array, no other text
- If content doesn't have clear question/answer pairs, put the main content in "content" and a summary/explanation in "answer"
- Use markdown formatting where appropriate (code blocks, lists, etc.)
- Each item should be self-contained
- Preserve technical accuracy - don't change code or technical terms`;

    const raw = await callOpenRouter([
      { role: "system", content: systemPrompt },
      { role: "user", content: rawContent },
    ]);

    const entries = parseGeneratedEntries(raw);

    return NextResponse.json({ entries, model: process.env.OPENROUTER_MODEL });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cleanup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
