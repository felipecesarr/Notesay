import { NextRequest, NextResponse } from 'next/server';
import { GoogleTranslateTTS } from '@/meetmate/services/ai/google-translate-tts';
import { auth } from "@/features/auth/controller/auth";
import { headers } from "next/headers";
import { hasActiveSubscription } from "@/features/subscription/utils/subscription-guard";

export async function POST(req: NextRequest) {
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

    // 3. Validar parâmetros
    const body = await req.json();
    const { text, lang = 'en' } = body;

    void 0;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required and must be a string' }, { status: 400 });
    }

    const ttsClient = new GoogleTranslateTTS();
    const audioBuffer = await ttsClient.synthesize(text, lang);

    return new NextResponse(audioBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("TTS API Error:");
    return NextResponse.json(
      { error: 'Failed to generate audio', details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}
