import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/openrouter";

const TYPE_INSTRUCTIONS: Record<string, string> = {
  qa: "Format as a clear Q&A. Provide a thorough, well-structured answer with examples where helpful. Use markdown for formatting.",
  note: "Rewrite as a clean, well-organized study note. Use headings, bullet points, and markdown formatting to make it easy to review.",
  snippet: "Explain the code clearly. Describe what it does, why it works, and any important details. Include the code in a markdown code block.",
  vocabulary: "Provide a clear definition, pronunciation guide if applicable, usage examples in sentences, and any related words or synonyms.",
  link: "Summarize the key takeaways from this resource. What should the reader learn from it? Use bullet points for clarity.",
};

export async function POST(request: NextRequest) {
  try {
    const { title, content, answer, type } = await request.json();

    if (!title && !content) {
      return NextResponse.json(
        { error: "Provide at least a title or content to enhance" },
        { status: 400 }
      );
    }

    const typeInstruction = TYPE_INSTRUCTIONS[type] || TYPE_INSTRUCTIONS.qa;

    const systemPrompt = `You are a learning assistant that creates high-quality study material.
Your task: Given a question/topic and optionally an existing answer, generate or improve the answer.

Entry type: ${type}
Instructions: ${typeInstruction}

Rules:
- Return ONLY the enhanced answer text (markdown supported), no preamble or meta-commentary
- If an existing answer is provided, improve and expand it while keeping the core meaning
- If no answer is provided, generate a comprehensive one from scratch
- Be concise but thorough — prioritize clarity over length
- Use markdown formatting: code blocks, lists, bold, etc. where appropriate`;

    const parts: string[] = [];
    if (title) parts.push(`Title: ${title}`);
    if (content) parts.push(`Content: ${content}`);
    if (answer) parts.push(`Existing answer to improve:\n${answer}`);
    else parts.push("No existing answer — please generate one from scratch.");

    const raw = await callOpenRouter([
      { role: "system", content: systemPrompt },
      { role: "user", content: parts.join("\n\n") },
    ]);

    return NextResponse.json({ answer: raw.trim() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Enhancement failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
