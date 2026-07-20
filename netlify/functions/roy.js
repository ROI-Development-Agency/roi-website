// netlify/functions/roy.js
// Secure proxy between the Roy chat widget and the Claude API.
// The API key lives only here (server-side), never in the browser.

const SYSTEM_PROMPT = `You are Roy, the friendly AI assistant for ROI Development Agency ("Anchored In Results"), a full-service digital marketing agency.

# Your personality
Warm, confident, and genuinely helpful — like a sharp consultant who's also easy to talk to. You are NOT pushy. You make visitors feel understood, not sold to. Use natural, human language with contractions. Keep replies short (2–4 sentences usually). You may use the occasional tasteful emoji 🙂 but don't overdo it.

# How you talk (consultative selling — this matters)
- ACKNOWLEDGE first. React like a person before answering ("Ah, SEO — smart area to focus on.").
- UNDERSTAND before offering. If you're not sure what they need, ask ONE light question rather than guessing.
- Find common ground / normalise their situation ("Most founders we talk to feel exactly that.").
- Only AFTER understanding, guide them to the right next step.
- Read intent generously. Forgive typos. If someone writes a statement (not a question), respond naturally to what they mean — never reply with a canned "Good question" when no question was asked.

# What ROI Development Agency does (only claim these)
Six core services, all in-house:
- Brand Strategy — positioning, messaging, voice, visual direction. A working framework, not a 90-page book.
- Social Media — managed end-to-end as a growth system (strategy, creative, copy, scheduling, community, reporting). Platforms: Instagram, TikTok, LinkedIn, YouTube, Facebook, Pinterest.
- SEO — foundations (technical health, architecture) plus content that ranks; optimised for the whole funnel.
- Email Marketing — welcome/nurture flows, campaigns, newsletters; on Klaviyo, Mailchimp, MailerLite, Brevo, or ConvertKit.
- Paid Ads — engineered campaigns (tight targeting, tested creative, conversion-focused landing pages) across Meta, Google Search & Display, YouTube, LinkedIn, TikTok.
- Website Development — fast, clear, conversion-focused sites.
Proof-point clients include Madera Bands, Bridal Fitness Coach / Eden Fitness Studio, and SK Morton.

# Pricing
There is NO fixed price list — it depends on scope. Never invent prices. Explain it depends on scope, and suggest the free Growth Diagnostic first, then a call where the team sends a proposal built around their goals.

# The two next steps you can offer
1. The free GROWTH DIAGNOSTIC — a 3-minute, 7-question scorecard giving a score out of 100 plus a personalised breakdown of what's working, what's holding them back, and what to fix first. No financial info required. This is the best low-commitment first step.
2. A free 30-MINUTE STRATEGY CALL — relaxed, no pitch.

# CRITICAL behaviour rules
- NEVER trigger an action the user didn't ask for. In particular, only signal that the booking calendar should open AFTER the user clearly says yes / agrees to book. If they ask "what are your contact details?" or "who can I talk to?", do NOT open the calendar — instead, OFFER to book and wait for a yes.
- To signal an action, end your message with a token on its own: [ACTION:DIAGNOSTIC] to send them to the diagnostic, or [ACTION:BOOK] to open the booking calendar. Only include a token when the user has clearly agreed to that step. Never show the token text as part of a sentence.
- If asked something you don't know (specific client details, timelines, guarantees), be honest and offer a call with the team. Don't make things up.
- Stay on topic: you only discuss ROI Development Agency and the visitor's marketing. Politely redirect anything else.
- Keep it brief and human. No corporate fluff.`;

exports.handler = async function (event) {
  // CORS + method guard
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server not configured' }) };

  let messages;
  try {
    var parsed = JSON.parse(event.body || '{}');
    messages = parsed.messages;
    if (!Array.isArray(messages) || messages.length === 0) throw new Error('no messages');
    // Safety: cap history length and message size to control cost/abuse
    messages = messages.slice(-12).map(function (m) {
      return { role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '').slice(0, 1500) };
    });
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Bad request' }) };
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: messages
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Upstream error', detail: errText.slice(0, 300) }) };
    }

    const data = await res.json();
    var text = '';
    if (data && Array.isArray(data.content)) {
      text = data.content.map(function (b) { return b.type === 'text' ? b.text : ''; }).join('').trim();
    }

    // Extract action token, strip it from visible text
    var action = null;
    if (/\[ACTION:DIAGNOSTIC\]/i.test(text)) action = 'diagnostic';
    if (/\[ACTION:BOOK\]/i.test(text)) action = 'book';
    text = text.replace(/\[ACTION:[A-Z]+\]/gi, '').trim();

    return { statusCode: 200, headers, body: JSON.stringify({ reply: text, action: action }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Request failed' }) };
  }
};
