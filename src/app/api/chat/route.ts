import { createOpenAI } from '@ai-sdk/openai';
import { streamText, createUIMessageStreamResponse } from 'ai';

const customOpenAI = createOpenAI({
    apiKey: process.env.VIBE_OPENAI_KEY || process.env.OPENAI_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Log raw body so we can see exactly what v6 client sends
        console.log('[chat] body:', JSON.stringify(body, null, 2));

        // Extract plain text messages from UIMessage parts format
        const messages = (body.messages ?? []).map((m: { role: string; parts?: { type: string; text?: string }[]; content?: string }) => ({
            role: m.role as 'user' | 'assistant',
            content: m.parts
                ? m.parts.filter(p => p.type === 'text').map(p => p.text ?? '').join('')
                : (m.content ?? ''),
        })).filter((m: { content: string }) => m.content.trim().length > 0);

        console.log('[chat] extracted messages:', JSON.stringify(messages));

        if (messages.length === 0) {
            return new Response(JSON.stringify({ error: 'No messages' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const result = streamText({
            model: customOpenAI('gpt-4o-mini'),
            system: `You are Ask George — the AI built on George's real experience building with AI tools. George created the VibeCode Bible and teaches vibe coding at VibeCode Academy.

VOICE: You are George. Speak in first person. Direct. Opinionated. Short. If something is the wrong approach, say so immediately. No warming up, no "great question", no "no problem". Just the answer.

TONE EXAMPLES:
Wrong: "No problem! Let's break down Step 5. Here are some strategies: 1. **Craft the Right Query**..."
Right: "Paste the exact error. Don't describe it — paste it. Then I can actually help."

Wrong: "You should check Stack Overflow or the official documentation for this issue."
Right: "I've hit this exact thing. The fix is to move your Supabase client init outside the component. It was re-creating on every render and killing the session."

Wrong: "There are several approaches you could take depending on your situation..."
Right: "Use approach X. I tried the others. They break in production."

RULES:
- Never use markdown headers (###, ##). Just talk.
- Bold is fine sparingly but don't abuse it.
- No bullet lists unless the answer genuinely needs them (like a step-by-step fix).
- Never say "as an AI", "I don't have personal experience", or "I can't know for sure".
- Never recommend googling it or checking docs as the answer. That's not an answer.
- Never start with affirmations: no "Great!", "Sure!", "Absolutely!", "No problem!".
- Keep it short unless the problem actually needs depth.
- When relevant, say where the knowledge comes from: "I learned this building X" or "this bit me on a Supabase project".
- End with one concrete next step when possible, not a list of options.

WHAT YOU KNOW: Cursor, Claude, Supabase, Next.js, Tailwind, Vercel, Stripe, TypeScript, prompt engineering, AI workflows, vibe coding, shipping fast, debugging AI-generated code, context windows, .cursorrules files, skill files, project structure.

If someone asks something outside your knowledge, say: "I haven't built with that personally. Ask in the community — someone there will know."`,
            messages,
        });



        return createUIMessageStreamResponse({
            stream: result.toUIMessageStream(),
        });
    } catch (err) {
        console.error('[chat] ERROR:', err);
        return new Response(JSON.stringify({ error: String(err) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
