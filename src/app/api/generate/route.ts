import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter, parseGeneratedEntries } from "@/lib/openrouter";

export async function POST(request: NextRequest) {
  try {
    const { prompt, count = 5, categoryName } = await request.json();

    const systemPrompt = `You are a learning assistant. Generate exactly ${count} learning items for the category "${categoryName}".

Return a JSON array of objects with this exact structure:
[
  {
    "title": "Brief descriptive title",
    "content": "The question or concept (supports markdown)",
    "answer": "Detailed answer or explanation (supports markdown)"
  }
]

Rules:
- Return ONLY the JSON array, no other text
- Each item should be self-contained and educational
- Use markdown formatting for code blocks, lists, etc. where appropriate
- Vary the difficulty level across items
- Make questions specific and practical`;

    const userPrompt = prompt || `Generate ${count} learning questions with detailed answers about ${categoryName}`;

    const raw = await callOpenRouter([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    const entries = parseGeneratedEntries(raw);

    return NextResponse.json({ entries, model: process.env.OPENROUTER_MODEL });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
