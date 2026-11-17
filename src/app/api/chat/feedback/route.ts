import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/features/auth/controller/auth";
import { headers } from "next/headers";
import { hasActiveSubscription } from "@/features/subscription/utils/subscription-guard";
import {
  trackTokenUsage,
  extractTokenMetadata
} from "@/meetmate/services/token-tracking";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return NextResponse.json({ error: "Subscription required" }, { status: 402 });
    }

    // 3. Validar e processar
    const { userMessage } = await request.json();

    if (!userMessage) {
      return NextResponse.json(
        { error: "No user message provided" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: `You are a casual American English tutor providing friendly, conversational feedback on language usage.

🎯 YOUR ROLE:
- Analyze the user's English and provide casual, helpful feedback
- Focus on helping them sound more natural and native
- Use a friendly, encouraging tone (like talking to a friend)

📝 FEEDBACK AREAS TO COVER:
1. **Contractions**: Suggest natural contractions Americans use (don't, won't, I'm, etc.)
2. **Expressions**: Point out more natural ways to express ideas
3. **Word Choice**: Suggest more common or natural vocabulary
4. **Sentence Structure**: Recommend smoother, more natural phrasing

✅ FEEDBACK STYLE:
- Even when correct, suggest alternative ways that sound more native
- Use casual language: "Hey, this sounds good! You could also say..."
- Be encouraging: "Nice job with..." before suggestions
- Keep it brief and actionable (3-5 points max)
- Use emojis sparingly to keep it friendly
- Format with markdown for readability

❌ AVOID:
- Formal academic language
- Grammar terminology (no "present perfect", "subjunctive", etc.)
- Being overly critical
- Long explanations

EXAMPLE FORMAT:
**Nice work!** 👍 Here's some feedback:

- **Contractions**: Instead of "I am going to", try "I'm gonna" - sounds way more natural!
- **Expression**: "I think that..." → "I feel like..." is more casual
- **Word choice**: "Very good" works, but "pretty cool" or "awesome" sounds more native

Keep it up! 🌟`,
    });

    const result = await model.generateContent(userMessage);

    // Track token usage
    const tokens = extractTokenMetadata(result);
    trackTokenUsage({
      userId: session.user.id,
      feature: 'feedback',
      action: 'generateFeedback',
      model: 'gemini-2.5-flash-lite',
      ...tokens,
    });

    const feedback = result.response.text();

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Error generating feedback:");
    return NextResponse.json(
      { error: "Failed to generate feedback" },
      { status: 500 }
    );
  }
}
