import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';

export const maxDuration = 60;

const critiqueResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallHarmonyScore: {
      type: Type.INTEGER,
      description: 'Overall Ikebana harmony score from 0 to 100.',
    },
    hankoVerdict: {
      type: Type.STRING,
      description:
        'Traditional 2-character Japanese Hanko seal verdict: "合格" (Passed / Harmonious, score >= 75), "精進" (Keep Refining, score 55-74), or "再考" (Recompose, score < 55).',
    },
    metrics: {
      type: Type.OBJECT,
      properties: {
        asymmetricBalance: {
          type: Type.INTEGER,
          description: 'Score 0-100 evaluating scalene triangle asymmetry.',
        },
        maNegativeSpace: {
          type: Type.INTEGER,
          description:
            'Score 0-100 evaluating intentional negative space (Ma) and breathing room.',
        },
        angleAccuracy: {
          type: Type.INTEGER,
          description:
            'Score 0-100 evaluating Shin, Soe, and Hikae stem tilt and azimuth angles.',
        },
      },
      required: ['asymmetricBalance', 'maNegativeSpace', 'angleAccuracy'],
    },
    vectorOverlay: {
      type: Type.OBJECT,
      description:
        'Normalized SVG line coordinates within a 290x260 viewBox tracing the detected Shin, Soe, and Hikae stems from their vessel anchor point (x1, y1) to their tips (x2, y2).',
      properties: {
        shinLine: {
          type: Type.OBJECT,
          properties: {
            x1: { type: Type.INTEGER },
            y1: { type: Type.INTEGER },
            x2: { type: Type.INTEGER },
            y2: { type: Type.INTEGER },
          },
          required: ['x1', 'y1', 'x2', 'y2'],
        },
        soeLine: {
          type: Type.OBJECT,
          properties: {
            x1: { type: Type.INTEGER },
            y1: { type: Type.INTEGER },
            x2: { type: Type.INTEGER },
            y2: { type: Type.INTEGER },
          },
          required: ['x1', 'y1', 'x2', 'y2'],
        },
        hikaeLine: {
          type: Type.OBJECT,
          properties: {
            x1: { type: Type.INTEGER },
            y1: { type: Type.INTEGER },
            x2: { type: Type.INTEGER },
            y2: { type: Type.INTEGER },
          },
          required: ['x1', 'y1', 'x2', 'y2'],
        },
      },
      required: ['shinLine', 'soeLine', 'hikaeLine'],
    },
    mastersObservations: {
      type: Type.OBJECT,
      properties: {
        strength: {
          type: Type.STRING,
          description:
            'One specific structural strength observed in the arrangement.',
        },
        microAdjustment: {
          type: Type.STRING,
          description:
            'One concrete, actionable micro-adjustment (with degree or millimeter guidance) to elevate balance.',
        },
        philosophicalNote: {
          type: Type.STRING,
          description:
            'A concise poetic observation on Ma (negative space), seasonal vitality, or line tension.',
        },
      },
      required: ['strength', 'microAdjustment', 'philosophicalNote'],
    },
  },
  required: [
    'overallHarmonyScore',
    'hankoVerdict',
    'metrics',
    'vectorOverlay',
    'mastersObservations',
  ],
};

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: 'v1beta' } });

    const body = await req.json();
    const { imageBase64, mimeType, targetPlan } = body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json(
        { error: 'Missing imageBase64 payload.' },
        { status: 400 }
      );
    }

    const cleanBase64 = imageBase64.includes(',')
      ? imageBase64.split(',')[1]
      : imageBase64;

    const targetContext = targetPlan
      ? `The practitioner intended to build "${targetPlan.styleTitle}" (${targetPlan.difficulty}) using the DIY anchor method "${targetPlan.diyAnchorMechanism?.methodName || 'organic anchor'}".
Intended placement steps:
${(targetPlan.steps || [])
  .map(
    (s: { stepNumber: number; title: string; placementAngles: string }) =>
      `- Step ${s.stepNumber} (${s.title}): ${s.placementAngles}`
  )
  .join('\n')}`
      : 'No specific blueprint was pre-selected; evaluate according to classical Moribana / Jiyuka Ikebana scalene triangle principles (Shin, Soe, Hikae proportions and Ma negative space).';

    const prompt = `You are a serene, perceptive Ikebana Master evaluating a practitioner's finished floral arrangement photograph.

${targetContext}

Analyze the uploaded photograph carefully:
1. Identify the primary Heaven line (Shin), secondary Man line (Soe), and tertiary Earth accent (Hikae) emerging from the vessel.
2. Estimate normalized vector coordinates inside a 290 (width) x 260 (height) SVG coordinate space tracing each of those three lines from the base anchor point (x1, y1) to the stem/bloom tip (x2, y2).
3. Score asymmetric balance, Ma (negative space), and angle accuracy realistically and constructively.
4. Provide a concise structural strength, one specific physical micro-adjustment (e.g., rotating or tilting a stem by a specific angle or trimming millimeters), and a poetic philosophical note.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType || 'image/jpeg',
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: critiqueResponseSchema,
        temperature: 0.4,
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error('Empty response returned from Gemini Vision.');
    }

    const parsedCritique = JSON.parse(rawText);
    return NextResponse.json(parsedCritique);
  } catch (error: unknown) {
    console.error('Error in /api/critique:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to evaluate Ikebana arrangement.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
