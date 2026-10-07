import OpenAI from "openai";
import https from "https";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ReferencedCard {
  _id: string;
  title: string;
  type: string;
  link?: string | null;
  tags?: any[];
}

interface AIExecutionResult {
  reply: string;
  provider: string;
  model: string;
}

/**
 * Direct caller for Google Gemini REST API
 */
async function callGemini(
  apiKey: string,
  modelName: string,
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const contents: any[] = [];

    // Include recent history
    for (const h of history) {
      contents.push({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content }],
      });
    }

    // Add current user prompt
    contents.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    const payload: any = {
      contents,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    };

    if (systemPrompt) {
      payload.systemInstruction = {
        parts: [{ text: systemPrompt }],
      };
    }

    const data = JSON.stringify(payload);

    const req = https.request(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
        timeout: 25000,
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed = JSON.parse(body);
              const text =
                parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
              if (text) {
                resolve(text);
              } else {
                reject(new Error("Gemini returned empty candidate parts"));
              }
            } catch (e: any) {
              reject(new Error(`Failed to parse Gemini JSON: ${e.message}`));
            }
          } else {
            reject(
              new Error(
                `Gemini error HTTP ${res.statusCode}: ${body.slice(0, 200)}`
              )
            );
          }
        });
      }
    );

    req.on("error", (err) => reject(err));
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Gemini request timed out"));
    });
    req.write(data);
    req.end();
  });
}

/**
 * Multi-provider fallback cascade engine.
 * Automatically tries Groq (Qwen 3.8 27B) -> Gemini (Flash) -> DeepSeek (Chat) -> Groq (GPT-OSS-120B).
 */
export async function executeAIFallback(
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string
): Promise<AIExecutionResult> {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const deepseekKey = process.env.DEEPSEEK_API_KEY;

  const errors: string[] = [];

  // Provider 1: Groq with Qwen (Blazing fast, official Qwen support)
  if (groqKey) {
    try {
      const groq = new OpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: groqKey,
        timeout: 20000,
      });

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        ...history.map((h) => ({
          role: h.role as "user" | "assistant" | "system",
          content: h.content,
        })),
        { role: "user", content: userMessage },
      ];

      const res = await groq.chat.completions.create({
        model: "qwen/qwen3.8-27b",
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      });

      const reply = res.choices[0]?.message?.content;
      if (reply) {
        return {
          reply,
          provider: "Groq",
          model: "Qwen 3.8 (27B)",
        };
      }
    } catch (err: any) {
      console.warn(`[AI Failover] Groq (Qwen) failed:`, err?.status || err?.message);
      errors.push(`Groq (Qwen): ${err?.message}`);
    }
  }

  // Provider 2: Google Gemini (Gemini Flash - huge context and very reliable)
  if (geminiKey) {
    // Try gemini-flash-latest, then gemini-3.8-flash
    for (const gemModel of ["gemini-flash-latest", "gemini-3.8-flash"]) {
      try {
        const reply = await callGemini(
          geminiKey,
          gemModel,
          systemPrompt,
          history,
          userMessage
        );
        if (reply) {
          return {
            reply,
            provider: "Google Gemini",
            model: "Gemini Flash",
          };
        }
      } catch (err: any) {
        console.warn(`[AI Failover] Gemini (${gemModel}) failed:`, err?.message);
        errors.push(`Gemini (${gemModel}): ${err?.message}`);
      }
    }
  }

  // Provider 3: DeepSeek (Native DeepSeek V3/R1)
  if (deepseekKey) {
    try {
      const ds = new OpenAI({
        baseURL: "https://api.deepseek.com",
        apiKey: deepseekKey,
        timeout: 25000,
      });

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        ...history.map((h) => ({
          role: h.role as "user" | "assistant" | "system",
          content: h.content,
        })),
        { role: "user", content: userMessage },
      ];

      const res = await ds.chat.completions.create({
        model: "deepseek-chat",
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      });

      const reply = res.choices[0]?.message?.content;
      if (reply) {
        return {
          reply,
          provider: "DeepSeek",
          model: "DeepSeek-V3",
        };
      }
    } catch (err: any) {
      console.warn(`[AI Failover] DeepSeek failed:`, err?.status || err?.message);
      errors.push(`DeepSeek: ${err?.message}`);
    }
  }

  // Provider 4: Groq Backup with GPT-OSS-120B
  if (groqKey) {
    try {
      const groq = new OpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: groqKey,
        timeout: 20000,
      });

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        ...history.map((h) => ({
          role: h.role as "user" | "assistant" | "system",
          content: h.content,
        })),
        { role: "user", content: userMessage },
      ];

      const res = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      });

      const reply = res.choices[0]?.message?.content;
      if (reply) {
        return {
          reply,
          provider: "Groq Backup",
          model: "GPT-OSS-120B",
        };
      }
    } catch (err: any) {
      console.warn(`[AI Failover] Groq backup model failed:`, err?.status || err?.message);
      errors.push(`Groq backup: ${err?.message}`);
    }
  }

  throw new Error(
    `All AI providers failed or rate limits were reached. Details: ${errors.join(
      " | "
    )}`
  );
}

/**
 * Ask Your Brain service: formats cards into context, sends prompt, and extracts cited cards.
 */
export async function askBrain({
  message,
  history = [],
  contents = [],
}: {
  message: string;
  history?: { role: "user" | "assistant"; content: string }[];
  contents?: any[];
}): Promise<{
  reply: string;
  referencedCards: ReferencedCard[];
  providerUsed: string;
  modelUsed: string;
}> {
  // Format cards into context for the LLM
  let contextBlock = "No memories saved yet.";
  if (contents && contents.length > 0) {
    const cardDescriptions = contents.slice(0, 60).map((c, i) => {
      const tagList = Array.isArray(c.tags)
        ? c.tags
            .map((t: any) => (typeof t === "string" ? t : t.title || ""))
            .filter(Boolean)
            .map((t: string) => `#${t}`)
            .join(" ")
        : "";

      const contentSnippet = c.note
        ? c.note.slice(0, 600) + (c.note.length > 600 ? "..." : "")
        : c.link || "No text content";

      return `[Item ${i + 1}] ID: ${c._id}
Title: "${c.title}"
Type: ${c.type}
Tags: ${tagList || "None"}
Details: ${contentSnippet}`;
    });

    contextBlock = cardDescriptions.join("\n---\n");
  }

  const systemPrompt = `You are "Second Brain AI", an intelligent and friendly personal knowledge assistant embedded directly in the user's Second Brain workspace.

The user has provided their collection of saved memories, bookmarks, links, YouTube videos, tweets, and notes below:

=== USER'S SECOND BRAIN MEMORIES ===
${contextBlock}
====================================

YOUR GOAL & GUIDELINES:
1. Help the user recall, search, synthesize, brainstorm, or summarize anything from their saved items.
2. Whenever you reference or cite specific items from the user's brain, you MUST mention them using this exact citation token format:
   [[card:CARD_ID|Card Title]]
   For example: "As noted in [[card:65f1a2b3c4d5e6f7a8b9c0d1|Backend Roadmap]], you should start with HTTP fundamentals..."
   The frontend will automatically turn this token into a clickable memory chip!
3. If the user asks general questions not directly in their brain, answer warmly and comprehensively, while pointing out any related ideas they have stored.
4. Keep explanations clear, well-structured, and use Markdown (bullet points, bold text, code blocks) for great readability.
5. Be concise yet insightful.`;

  const result = await executeAIFallback(systemPrompt, history, message);

  // Extract referenced cards from the reply
  const referencedCards: ReferencedCard[] = [];
  const cardRegex = /\[\[card:([a-f0-9]{24})\|([^\]]+)\]\]/gi;
  let match: RegExpExecArray | null;

  while ((match = cardRegex.exec(result.reply)) !== null) {
    const cardId = match[1];
    const foundCard = contents.find((c) => c._id?.toString() === cardId);
    if (foundCard && !referencedCards.some((rc) => rc._id === cardId)) {
      referencedCards.push({
        _id: cardId,
        title: foundCard.title,
        type: foundCard.type,
        link: foundCard.link,
        tags: foundCard.tags,
      });
    }
  }

  // Also clean the citation tokens in the text so it displays nicely if rendered directly
  const cleanReply = result.reply.replace(
    /\[\[card:([a-f0-9]{24})\|([^\]]+)\]\]/g,
    "**$2**"
  );

  return {
    reply: cleanReply,
    referencedCards,
    providerUsed: result.provider,
    modelUsed: result.model,
  };
}

/**
 * Summarize a specific card from user's Second Brain
 */
export async function summarizeCard({
  title,
  type,
  link,
  note,
  tags = [],
}: {
  title: string;
  type: string;
  link?: string | null;
  note?: string | null;
  tags?: any[];
}): Promise<{
  summary: string;
  provider: string;
  model: string;
}> {
  const tagList = Array.isArray(tags)
    ? tags
        .map((t: any) => (typeof t === "string" ? t : t?.title || ""))
        .filter(Boolean)
        .map((t: string) => `#${t}`)
        .join(" ")
    : "";

  const systemPrompt = `You are "Second Brain AI", an executive intelligence summarizer.
Your task is to generate a high-yield, structured summary of a saved item from the user's second brain.

CARD METADATA:
Title: "${title}"
Type: ${type}
Tags: ${tagList || "None"}
${link ? `URL / Resource: ${link}` : ""}
${note ? `Full Content / Note:
${note}` : ""}

SUMMARIZATION FORMAT GUIDELINES:
1. Start with an executive **TL;DR** in 1-2 concise sentences.
2. Provide **Key Takeaways & Core Concepts**: 2 to 4 bullet points highlighting the most essential insights.
3. If applicable, add a 1-sentence **Action Item or Why It Matters**.
4. Use clean Markdown with bold text for emphasis.
5. If the card only has a title and URL (e.g. YouTube or article link), explain what the topic covers based on the subject and URL.
6. Keep it clean, high-density, and easy to read in 10-15 seconds.`;

  const result = await executeAIFallback(
    systemPrompt,
    [],
    "Please generate the executive summary for this card."
  );

  return {
    summary: result.reply,
    provider: result.provider,
    model: result.model,
  };
}

/**
 * Auto-suggest relevant tags for a card based on its content
 */
export async function suggestTags({
  title = "",
  type = "note",
  link = "",
  note = "",
  existingTags = [],
  knownUserTags = [],
}: {
  title?: string;
  type?: string;
  link?: string | null;
  note?: string | null;
  existingTags?: string[];
  knownUserTags?: string[];
}): Promise<{
  tags: string[];
  provider: string;
  model: string;
}> {
  const existingList = existingTags.map((t) => t.toLowerCase().trim()).filter(Boolean);
  const knownList = knownUserTags.map((t) => t.toLowerCase().trim()).filter(Boolean);

  const systemPrompt = `You are an AI tag generator for a personal knowledge management system.
Given the card details, suggest between 3 to 6 concise, highly relevant tags.

RULES:
1. Return ONLY lowercase single-word or hyphenated tags (e.g. "architecture", "clean-code", "typescript", "devops", "health").
2. No "#" symbols.
3. If any known user tags are relevant, prefer using them so the user's taxonomy stays unified.
4. Avoid duplicate tags from existing tags list: ${JSON.stringify(existingList)}.
5. Respond ONLY with a valid JSON array of strings, e.g. ["tag1", "tag2", "tag3"]. No markdown formatting, no explanations.`;

  const userPrompt = `CARD DETAILS:
Title: "${title}"
Type: ${type}
${link ? `URL: ${link}` : ""}
${note ? `Note / Content: ${note.slice(0, 1000)}` : ""}
${knownList.length > 0 ? `Known User Tags in Brain: ${knownList.slice(0, 30).join(", ")}` : ""}`;

  const result = await executeAIFallback(systemPrompt, [], userPrompt);

  let tags: string[] = [];
  try {
    const cleaned = result.reply.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      tags = parsed
        .map((t) => String(t).toLowerCase().replace(/[^a-z0-9_-]/g, "").trim())
        .filter((t) => t.length > 1 && !existingList.includes(t))
        .slice(0, 6);
    }
  } catch (err) {
    const matches = result.reply.match(/"([a-zA-Z0-9_-]+)"/g);
    if (matches) {
      tags = matches
        .map((m) => m.replace(/"/g, "").toLowerCase().trim())
        .filter((t) => t.length > 1 && !existingList.includes(t))
        .slice(0, 6);
    }
  }

  return {
    tags,
    provider: result.provider,
    model: result.model,
  };
}

export interface SemanticMatch {
  id: string;
  relevanceScore: number;
  reason: string;
}

/**
 * Perform conceptual / semantic search over user's memories
 */
export async function semanticSearch({
  query,
  contents = [],
}: {
  query: string;
  contents: any[];
}): Promise<{
  matches: SemanticMatch[];
  provider: string;
  model: string;
}> {
  if (!contents || contents.length === 0) {
    return { matches: [], provider: "None", model: "None" };
  }

  const cardList = contents.slice(0, 50).map((c, i) => {
    const tagList = Array.isArray(c.tags)
      ? c.tags.map((t: any) => (typeof t === "string" ? t : t?.title || "")).filter(Boolean).join(", ")
      : "";
    const snippet = c.note ? c.note.slice(0, 400) : c.link || "";
    return `[Item ${i + 1}] ID: ${c._id}
Title: "${c.title}"
Type: ${c.type}
Tags: ${tagList || "None"}
Details: ${snippet}`;
  }).join("\n---\n");

  const systemPrompt = `You are a semantic search engine for a personal knowledge base.
Your job is to identify all saved items that are conceptually, semantically, or thematically related to the user's search query, EVEN IF they do not contain the exact query words.

Examples:
- Query "clean architecture" matches items on "SOLID principles", "hexagonal architecture", "ports & adapters", "domain-driven design".
- Query "fitness" matches items on "hypertrophy", "calisthenics", "meal prep", "bench press".
- Query "financial independence" matches items on "index funds", "dividend investing", "FIRE", "savings rate".

SAVED ITEMS:
${cardList}

Respond ONLY with valid JSON in this exact structure:
{
  "matches": [
    {
      "id": "exact_item_id_from_above",
      "relevanceScore": 0.95,
      "reason": "1 short sentence explaining the conceptual connection"
    }
  ]
}
Only include items with genuine relevance (score >= 0.5). If no items are conceptually related, return {"matches": []}.`;

  const result = await executeAIFallback(systemPrompt, [], `User Search Query: "${query}"`);

  let matches: SemanticMatch[] = [];
  try {
    const cleaned = result.reply.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (parsed && Array.isArray(parsed.matches)) {
      matches = parsed.matches
        .filter((m: any) => m && m.id && typeof m.relevanceScore === "number" && m.relevanceScore >= 0.5)
        .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore);
    }
  } catch (err) {
    console.warn("Failed to parse semantic search JSON:", err);
  }

  return {
    matches,
    provider: result.provider,
    model: result.model,
  };
}

