import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    }

    const { images, inventory, selectedPlan } = await req.json();

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: 'Original material photo(s) are required to render without hallucinating items.' },
        { status: 400 }
      );
    }

    if (!selectedPlan) {
      return NextResponse.json({ error: 'No arrangement blueprint selected.' }, { status: 400 });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { apiVersion: 'v1beta' },
    });

    const imageParts = images.map((img: { base64: string; mimeType?: string }) => ({
      inlineData: {
        data: img.base64.includes(',') ? img.base64.split(',')[1] : img.base64,
        mimeType: img.mimeType || 'image/jpeg',
      },
    }));

    const inventoryList = (inventory || [])
      .map(
        (item: { role: string; name: string; dimensions: string; notes?: string }) =>
          `- [${item.role.toUpperCase()}] ${item.name} (${item.dimensions})${item.notes ? `: ${item.notes}` : ''}`
      )
      .join('\n');

    const stepList = (selectedPlan.steps || [])
      .map(
        (s: {
          stepNumber: number;
          title: string;
          mizukiriCutSpec: string;
          tameruTechnique: string;
          placementAngles: string;
        }) =>
          `Step ${s.stepNumber} — ${s.title}: Cut=${s.mizukiriCutSpec}; Bend=${s.tameruTechnique}; Angle=${s.placementAngles}`
      )
      .join('\n');

    const prompt = `Create a photorealistic eye-level studio reference photograph showing the completed Ikebana arrangement assembled from the exact physical materials shown in the reference photo(s).

STRICT ZERO-HALLUCINATION CONSTRAINTS:
1. Use ONLY the exact vessel, branches, flowers, foliage, and stones visible in the attached reference image(s). Match their exact colors, petal shapes, bark texture, stone shapes, and ceramic glaze.
2. Do NOT add any extra flowers, filler leaves, moss, decorative pebbles, stands, or metal kenzan pin frogs that are not present in the reference image(s). Do NOT include the measuring ruler in the final arrangement.
3. Follow the exact structural blueprint "${selectedPlan.styleTitle}" below:

DETECTED MATERIALS & CALIBRATED SIZES:
${inventoryList}

ZERO-KENZAN ANCHOR MECHANISM:
- ${selectedPlan.diyAnchorMechanism?.methodName}: ${selectedPlan.diyAnchorMechanism?.setupInstructions}

EXACT CUT LENGTHS, CURVES & PLACEMENT ANGLES:
${stepList}

COMPOSITION & LIGHTING:
- Eye-level front-facing view on a clean, quiet matte neutral surface with soft natural window light and realistic water reflections inside the vessel.
- Preserve authentic asymmetric scalene balance and generous negative space (Ma) matching the exact angles specified above.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ role: 'user', parts: [{ text: prompt }, ...imageParts] }],
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p: { inlineData?: { data?: string; mimeType?: string } }) => p.inlineData?.data);

    if (!imagePart?.inlineData?.data) {
      throw new Error('No preview image returned from Gemini.');
    }

    const mimeType = imagePart.inlineData.mimeType || 'image/png';
    const renderedImageBase64 = `data:${mimeType};base64,${imagePart.inlineData.data}`;

    return NextResponse.json({ renderedImageBase64 });
  } catch (error: unknown) {
    console.error('Error in /api/render-preview:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate reference composition.' },
      { status: 500 }
    );
  }
}
