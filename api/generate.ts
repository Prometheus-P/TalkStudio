/**
 * Vercel Edge Function - AI 대화 생성
 * Upstage Solar API를 사용한 대화 생성
 *
 * 엔드포인트: POST /api/generate
 */

export const config = {
  runtime: 'edge',
};

interface GenerateRequest {
  prompt: string;
  messageCount?: number;
  style?: 'casual' | 'formal' | 'romantic' | 'funny' | 'dramatic';
  language?: 'ko' | 'en' | 'ja';
}

interface Message {
  id: string;
  role: 'me' | 'other';
  authorId: string;
  text: string;
  datetime: string;
}

const STYLE_DESCRIPTIONS: Record<string, string> = {
  casual: '친근하고 편안한 일상 대화',
  formal: '정중하고 격식 있는 대화',
  romantic: '로맨틱하고 애정 어린 대화',
  funny: '유머러스하고 재미있는 대화',
  dramatic: '극적이고 감정적인 대화',
};

const LANGUAGE_MAP: Record<string, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
};

function buildSystemPrompt(
  style: string,
  language: string,
  messageCount: number
): string {
  const styleDesc = STYLE_DESCRIPTIONS[style] || style;
  const lang = LANGUAGE_MAP[language] || language;

  return `You are a conversation generator for a viral chat screenshot maker.
Generate a realistic ${styleDesc} between two people.

Rules:
1. Output ONLY valid JSON array, no other text
2. Generate exactly ${messageCount} messages
3. Language: ${lang}
4. Alternate speakers naturally (not strictly alternating)
5. Include realistic elements like:
   - Short reactions (ㅋㅋ, ㅎㅎ, ㅠㅠ for Korean)
   - Emojis where appropriate
   - Natural conversation flow

JSON format (strictly follow this):
[
  {"speaker": "me", "text": "message text"},
  {"speaker": "other", "text": "response"}
]

speaker must be "me" or "other"`;
}

function formatDateTime(): string {
  const now = new Date();
  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? '오후' : '오전';
  const displayHours = hours > 12 ? hours - 12 : hours || 12;

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day} ${period} ${displayHours}:${minutes}`;
}

function parseMessages(messagesData: Array<{ speaker: string; text: string }>): Message[] {
  const messages: Message[] = [];
  const baseTime = formatDateTime();

  for (let i = 0; i < messagesData.length; i++) {
    const msg = messagesData[i];
    if (!msg) continue;
    const speaker = msg.speaker?.toLowerCase();
    const role = speaker === 'me' ? 'me' : 'other';
    const text = String(msg.text ?? '').trim();

    if (!text) continue;

    messages.push({
      id: `ai-${Date.now()}-${i}`,
      role,
      authorId: role,
      text,
      datetime: baseTime,
    });
  }

  return messages;
}

export default async function handler(req: Request): Promise<Response> {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Check API key
  const apiKey = process.env.UPSTAGE_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Upstage API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body: GenerateRequest = await req.json();

    // Validate input
    if (!body.prompt || typeof body.prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = body.prompt.trim();
    const messageCount = Math.min(Math.max(body.messageCount || 10, 2), 30);
    const style = body.style || 'casual';
    const language = body.language || 'ko';

    // Build prompts
    const systemPrompt = buildSystemPrompt(style, language, messageCount);
    const userPrompt = `Generate a conversation about: ${prompt}`;

    // Call Upstage Solar API
    const response = await fetch('https://api.upstage.ai/v1/solar/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'solar-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Upstage API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'AI generation failed', details: errorData }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Empty response from AI' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse JSON response
    let messagesData: Array<{ speaker: string; text: string }>;
    try {
      const parsed = JSON.parse(content);
      messagesData = Array.isArray(parsed) ? parsed : parsed.messages || [];
    } catch {
      // Try to extract JSON array from response
      const start = content.indexOf('[');
      const end = content.lastIndexOf(']') + 1;
      if (start !== -1 && end > start) {
        messagesData = JSON.parse(content.slice(start, end));
      } else {
        return new Response(
          JSON.stringify({ error: 'Failed to parse AI response' }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const messages = parseMessages(messagesData);

    if (messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid messages generated' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          messages,
          metadata: {
            model: 'solar-mini',
            tokensUsed: data.usage?.total_tokens || 0,
            generatedAt: new Date().toISOString(),
          },
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Generate error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
