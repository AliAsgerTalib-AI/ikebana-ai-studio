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

    const vesselItem = (inventory || []).find(
      (item: { role: string }) => item.role === 'vessel'
    );

    const vesselLockText = vesselItem
      ? `LOCKED VESSEL IDENTITY (CRITICAL — DO NOT ALTER):
- Exact Container: ${vesselItem.name} (${vesselItem.dimensions})${vesselItem.notes ? ` — ${vesselItem.notes}` : ''}
- You MUST reproduce the EXACT vase/container shown in the attached reference photograph(s): identical silhouette, height-to-width proportions, rim lip shape, neck/body contour, material (e.g., glass, ceramic, metal, stoneware), color/glaze, transparency, and surface texture.
- NEVER replace this container with a generic shallow ceramic suiban bowl or any other vase.`
      : `LOCKED VESSEL IDENTITY (CRITICAL — DO NOT ALTER):
- Reproduce the EXACT container/vase shown in the attached reference photograph(s) with identical shape, proportions, color, material, and rim profile. Never substitute a generic bowl.`;

    const botanicalItems = (inventory || [])
      .filter((item: { role: string }) => item.role !== 'vessel')
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

    const prompt = `Edit and composite the exact physical objects shown in the attached reference photograph(s) into a completed eye-level Ikebana arrangement.

${vesselLockText}

STRICT ZERO-HALLUCINATION MATERIAL RULES:
1. Keep the EXACT vase/container from the source photo standing upright on a clean matte neutral surface, and insert the botanical stems and anchors from the source photo directly into that exact container.
2. Use ONLY the exact branches, flowers, foliage, and stones visible in the attached reference image(s)—preserving their exact petal colors, stem thickness, bark/leaf shape, and stone textures.
3. Do NOT invent extra flowers, filler greenery, moss, or metal kenzan frogs not present in the source photo(s), and remove the measuring ruler from the scene.

ARRANGEMENT BLUEPRINT ("${selectedPlan.styleTitle}"):
BOTANICAL ELEMENTS & ANCHORS:
${botanicalItems}

INTERNAL ANCHORING MECHANISM:
- ${selectedPlan.diyAnchorMechanism?.methodName}: ${selectedPlan.diyAnchorMechanism?.setupInstructions}

EXACT LENGTHS, CURVES & PLACEMENT ANGLES:
${stepList}

PHOTOGRAPHIC FRAMING:
- Eye-level front view showing the full height of the exact source vase and the full height of the Shin branch above it, lit with soft natural studio window light.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ role: 'user', parts: [...imageParts, { text: prompt }] }],
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(
      (p: { inlineData?: { data?: string; mimeType?: string } }) => p.inlineData?.data
    );

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
