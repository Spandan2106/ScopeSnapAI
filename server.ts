import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Shared Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// JSON Schema definition for ScopeProposal
const proposalResponseSchema = {
  type: Type.OBJECT,
  properties: {
    projectTitle: { type: Type.STRING, description: "A concise professional title for the project" },
    clientName: { type: Type.STRING, description: "Client or prospect name if mentioned, otherwise 'Valued Client'" },
    freelancerName: { type: Type.STRING, description: "Freelancer or agency name" },
    agencyName: { type: Type.STRING, description: "Agency or brand name" },
    currency: { type: Type.STRING, description: "Currency symbol or code (INR, USD, EUR, etc.)" },
    tone: { type: Type.STRING, description: "Tone of the proposal" },
    confidenceScore: { type: Type.STRING, description: "High, Medium, or Low (Needs Clarification)" },
    executiveSummary: { type: Type.STRING, description: "Concise 2-3 paragraph project summary capturing context, vision, and high-level goal" },
    coreObjective: { type: Type.STRING, description: "The single primary business goal of this project" },
    targetAudience: { type: Type.STRING, description: "Identified or assumed target audience / end users" },
    requirements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          category: { type: Type.STRING, description: "e.g. Frontend UI/UX, Backend & API, Integrations & Payments, CMS & Admin, SEO & Performance" },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          isConfirmed: { type: Type.BOOLEAN, description: "True if explicitly stated by client; false if inferred or an assumption" },
          priority: { type: Type.STRING, description: "Must-Have, Should-Have, or Nice-to-Have" },
          deliverable: { type: Type.STRING, description: "Specific verifiable output" },
        },
        required: ["id", "category", "title", "description", "isConfirmed", "priority", "deliverable"],
      },
    },
    assumptions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          item: { type: Type.STRING, description: "Assumption made regarding content, credentials, hosting, etc." },
          impact: { type: Type.STRING, description: "Impact on timeline/budget if assumption changes" },
        },
        required: ["id", "item", "impact"],
      },
    },
    explicitExclusions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          item: { type: Type.STRING, description: "Clear item out-of-scope to prevent scope creep" },
          reason: { type: Type.STRING, description: "Why it is excluded from this phase" },
        },
        required: ["id", "item", "reason"],
      },
    },
    scopeCreepFlags: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          risk: { type: Type.STRING, description: "Potential scope risk or ambiguous requirement" },
          mitigation: { type: Type.STRING, description: "Recommended mitigation or boundary rule" },
        },
        required: ["id", "risk", "mitigation"],
      },
    },
    clarifyingQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          category: { type: Type.STRING, description: "Category of question" },
          question: { type: Type.STRING, description: "Precise, polite question to ask client" },
          whyItMatters: { type: Type.STRING, description: "Why getting this answered impacts cost, timeline or architecture" },
          severity: { type: Type.STRING, description: "Critical, Important, or Nice to Know" },
        },
        required: ["id", "category", "question", "whyItMatters", "severity"],
      },
    },
    milestones: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          phaseNumber: { type: Type.INTEGER },
          title: { type: Type.STRING, description: "Phase title" },
          estimatedDuration: { type: Type.STRING, description: "Clearly labeled estimate, e.g. '10-12 business days (Est.)'" },
          deliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
          clientDependencies: { type: Type.STRING, description: "Client input needed before or during phase" },
        },
        required: ["id", "phaseNumber", "title", "estimatedDuration", "deliverables", "clientDependencies"],
      },
    },
    totalEstimatedTimeline: { type: Type.STRING, description: "Overall timeline estimate marked clearly as tentative" },
    pricing: {
      type: Type.OBJECT,
      properties: {
        budgetProvided: { type: Type.BOOLEAN },
        pricingModel: { type: Type.STRING, description: "Fixed Milestone-Based, Discovery Sprint + Build, or Hourly/T&M" },
        currency: { type: Type.STRING },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              item: { type: Type.STRING },
              description: { type: Type.STRING },
              cost: { type: Type.STRING, description: "If budget provided, calculated allocation. If no budget provided, set to '[To Be Quoted]' or editable placeholder. NEVER invent an arbitrary price when client didn't supply one." },
              isEstimated: { type: Type.BOOLEAN },
            },
            required: ["id", "item", "description", "cost", "isEstimated"],
          },
        },
        subtotal: { type: Type.STRING, description: "Total or '[Pending Final Scope]'" },
        paymentSchedule: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              stage: { type: Type.STRING },
              percentage: { type: Type.STRING },
              trigger: { type: Type.STRING },
            },
            required: ["stage", "percentage", "trigger"],
          },
        },
        taxNotes: { type: Type.STRING, description: "GST / tax terms, e.g. 18% GST if Indian invoice" },
        disclaimer: { type: Type.STRING, description: "Disclaimer stating estimates are subject to clarifying questions and formal agreement" },
      },
      required: ["budgetProvided", "pricingModel", "currency", "items", "subtotal", "paymentSchedule", "taxNotes", "disclaimer"],
    },
    clientFacingProposalMarkdown: { type: Type.STRING, description: "Full formal, client-ready proposal formatted in clean Markdown with headers, bullet points, scope breakdown, milestone tables, exclusions, and acceptance section." },
    followUpMessageEmail: {
      type: Type.OBJECT,
      properties: {
        subject: { type: Type.STRING },
        body: { type: Type.STRING },
      },
      required: ["subject", "body"],
    },
    followUpMessageWhatsApp: { type: Type.STRING, description: "Polite, crisp WhatsApp follow-up message with formatting (*bold*) ready to send to the client." },
  },
  required: [
    "projectTitle", "clientName", "freelancerName", "agencyName", "currency", "tone",
    "confidenceScore", "executiveSummary", "coreObjective", "targetAudience",
    "requirements", "assumptions", "explicitExclusions", "scopeCreepFlags",
    "clarifyingQuestions", "milestones", "totalEstimatedTimeline", "pricing",
    "clientFacingProposalMarkdown", "followUpMessageEmail", "followUpMessageWhatsApp"
  ],
};

// API: Analyze Brief
app.post('/api/analyze-brief', async (req: Request, res: Response) => {
  try {
    const {
      brief,
      freelancerName = 'Freelance Developer',
      businessName = '',
      clientName = '',
      currency = 'INR',
      tone = 'Professional & Consultative',
      estimatedBudget = '',
      targetTimeline = '',
      imageBase64,
      imageMimeType = 'image/png',
    } = req.body;

    if (!brief && !imageBase64) {
      return res.status(400).json({ error: 'Please provide either a project brief or an image/screenshot.' });
    }

    const systemInstruction = `You are ScopeSnap AI, an expert proposal architect and technical project scoping advisor built for freelance web developers and agency owners (especially in India and global freelance markets).

Your mission is to convert rough, unstructured client inquiries (WhatsApp messages, quick emails, brief RFPs, or voice transcripts) into ironclad, structured project proposals.

CRITICAL RULES:
1. DISTINGUISH CONFIRMED FROM ASSUMPTIONS: Mark confirmed requirements (isConfirmed: true) ONLY if explicitly requested in the brief. If something is a logical consequence or best practice (like SSL, responsive design, admin dashboard), set isConfirmed: false and document it in assumptions.
2. ZERO PRICE FABRICATION: If the user or client did NOT supply a budget or estimate, do NOT invent arbitrary currency numbers. Label costs as '[To Be Quoted]' or '[Est. Pending Scope]' so the freelancer enters their rate. If a budget IS provided, allocate it sensibly across milestone deliverables.
3. EXPLICIT EXCLUSIONS: To protect freelance developers from scope creep, explicitly list what is NOT included (e.g., custom payment gateways outside standard Razorpay/Stripe, data entry of 500+ items, multi-language localization unless requested, third-party API fee costs, custom mobile apps).
4. CLARIFYING QUESTIONS: Identify 3 to 6 sharp, high-value questions that unblock architecture or pricing decisions.
5. ESTIMATED TIMELINES: All timelines must be explicitly marked as estimates and highlight client dependencies (like content, media, credentials).
6. TONE: Adapt to the specified tone (${tone}).
7. CURRENCY: Default is ${currency} (use ₹ for INR, $ for USD, etc.).
8. WHATSAPP & EMAIL FOLLOW-UPS: Produce an immediate, polite client communication that can be sent in 1 click.
`;

    const userPrompt = `
Analyze this project inquiry and generate the complete ScopeSnap proposal:

FREELANCER / AGENCY DETAILS:
- Freelancer Name: ${freelancerName || 'Web Developer'}
- Agency/Business Name: ${businessName || 'Digital Studio'}
- Target Currency: ${currency}
- Desired Tone: ${tone}
- Budget Hint (if provided): ${estimatedBudget ? `${currency} ${estimatedBudget}` : 'None provided (Do NOT fabricate prices; use [To Be Quoted])'}
- Timeline Target (if provided): ${targetTimeline || 'Not specified (provide realistic industry estimate)'}
- Client Name (if known): ${clientName || 'Inferred from brief or default'}

CLIENT INQUIRY / BRIEF:
"""
${brief || 'See attached screenshot/image.'}
"""

Ensure you return a valid JSON object matching the exact schema provided.
`;

    const contents: any[] = [];
    if (imageBase64) {
      contents.push({
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: imageMimeType,
            },
          },
          { text: userPrompt },
        ],
      });
    } else {
      contents.push({
        parts: [{ text: userPrompt }],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: proposalResponseSchema,
        temperature: 0.2,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Gemini returned an empty response.');
    }

    const proposalData = JSON.parse(responseText);
    return res.json(proposalData);
  } catch (error: any) {
    console.error('Error analyzing brief:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred while generating the proposal. Please try again.',
    });
  }
});

// API: Refine Proposal with quick instructions
app.post('/api/refine-proposal', async (req: Request, res: Response) => {
  try {
    const { currentProposal, instruction } = req.body;

    if (!currentProposal || !instruction) {
      return res.status(400).json({ error: 'currentProposal and instruction are required.' });
    }

    const systemInstruction = `You are ScopeSnap AI. You are refining an existing project proposal based on user feedback.
Preserve the existing structure and verified details, but accurately apply the user's requested modifications.
Maintain the same JSON schema strictly.`;

    const prompt = `
Current Proposal JSON:
${JSON.stringify(currentProposal, null, 2)}

User's Refinement Instruction:
"${instruction}"

Update the proposal according to the user's instruction and return the updated proposal matching the exact JSON schema.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: proposalResponseSchema,
        temperature: 0.2,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response from model');
    }

    const updatedProposal = JSON.parse(responseText);
    return res.json(updatedProposal);
  } catch (error: any) {
    console.error('Error refining proposal:', error);
    return res.status(500).json({
      error: error.message || 'Failed to refine proposal.',
    });
  }
});

// API: Generate Audio narration of Executive Summary using gemini-3.8-flash-lite-tts
app.post('/api/generate-tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS.' });
    }

    // Truncate to reasonable length for audio summary if too long
    const cleanText = text.slice(0, 1200);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: 'Professional, articulate consultant',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('No audio generated');
    }

    res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('Error generating speech:', error);
    res.status(500).json({ error: error.message || 'Audio generation failed' });
  }
});

// Vite Middleware for Dev / Static serving for Prod
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ScopeSnap AI] Server running on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
