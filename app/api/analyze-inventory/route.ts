import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';

export const maxDuration = 60;

const SCHOOL_RULES: Record<string, string> = {
  sogetsu: `SŌGETSU SCHOOL RULEBOOK (草月流):
- Emphasize sculptural line, dramatic asymmetry, negative space (Ma), and creative structural tension.
- Allow rim-to-rim tension arches, bold diagonal planes, and expressive Tameru curves while respecting zero-kenzan stability.`,
  ikenobo: `IKENOBŌ SCHOOL RULEBOOK (池坊 — Shōka / Classical Moribana):
- Strictly enforce MIZUGIWA ("water's edge"): all primary stems (Shin, Soe, Hikae/Tai) must emerge together from a single unified point and rise tightly bundled for 50–80mm above the water surface before branching into their respective angles.
- Maintain dignified, restrained vertical poise and classical scalene hierarchy.`,
  ohara: `OHARA SCHOOL RULEBOOK (小原流 — Landscape Moribana / Hana-ishō):
- Emphasize seasonal landscape naturalism and expansive visible water surface.
- Favor lower, sweeping horizontal planes, natural cluster groupings at the base, and gentle water-skimming angles rather than tall vertical spires.`,
};

const inventoryAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    identifiedItems: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          role: {
            type: Type.STRING,
            enum: ['vessel', 'shin', 'soe', 'hikae', 'anchor', 'foliage'],
          },
          dimensions: { type: Type.STRING },
          naturalCurvatureDegrees: { type: Type.INTEGER },
          notes: { type: Type.STRING },
        },
        required: [
          'id',
          'name',
          'role',
          'dimensions',
          'naturalCurvatureDegrees',
          'notes',
        ],
      },
    },
    arrangements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          styleId: {
            type: Type.STRING,
            enum: ['moribana-slanted', 'moribana-upright', 'jiyuka-freestyle'],
          },
          styleTitle: { type: Type.STRING },
          difficulty: {
            type: Type.STRING,
            enum: ['Beginner', 'Intermediate', 'Advanced'],
          },
          stabilityScore: { type: Type.STRING },
          diyAnchorMechanism: {
            type: Type.OBJECT,
            properties: {
              methodName: { type: Type.STRING },
              materialsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
              setupInstructions: { type: Type.STRING },
            },
            required: ['methodName', 'materialsUsed', 'setupInstructions'],
          },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                stepNumber: { type: Type.INTEGER },
                title: { type: Type.STRING },
                estimatedMinutes: { type: Type.INTEGER },
                requiredTools: { type: Type.ARRAY, items: { type: Type.STRING } },
                description: { type: Type.STRING },
                mizukiriCutSpec: { type: Type.STRING },
                tameruTechnique: { type: Type.STRING },
                placementAngles: { type: Type.STRING },
              },
              required: [
                'stepNumber',
                'title',
                'estimatedMinutes',
                'requiredTools',
                'description',
                'mizukiriCutSpec',
                'tameruTechnique',
                'placementAngles',
              ],
            },
          },
        },
        required: [
          'styleId',
          'styleTitle',
          'difficulty',
          'stabilityScore',
          'diyAnchorMechanism',
          'steps',
        ],
      },
    },
  },
  required: ['identifiedItems', 'arrangements'],
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

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { apiVersion: 'v1beta' },
    });

    const { images = [], school = 'sogetsu', existingInventory } = await req.json();
    const hasImages = Array.isArray(images) && images.length > 0;
    const hasExistingInventory =
      Array.isArray(existingInventory) && existingInventory.length > 0;

    if (!hasImages && !hasExistingInventory) {
      return NextResponse.json(
        { error: 'At least one material photo or existing inventory list is required.' },
        { status: 400 }
      );
    }

    const activeSchoolRule = SCHOOL_RULES[school] || SCHOOL_RULES.sogetsu;

    const imageParts = hasImages
      ? images.map((img: { base64: string; mimeType?: string }) => ({
          inlineData: {
            data: img.base64.includes(',')
              ? img.base64.split(',')[1]
              : img.base64,
            mimeType: img.mimeType || 'image/jpeg',
          },
        }))
      : [];

    const inventoryInstruction = hasExistingInventory
      ? `USE THIS VERIFIED INVENTORY LIST VERBATIM (return it unchanged in identifiedItems):
${JSON.stringify(existingInventory, null, 2)}`
      : `STEP 1 — REFERENCE SCALE CALIBRATION:
- Check if a ruler, measuring tape, or grid mat is visible in the photo(s) and calibrate pixel-to-millimeter scale before measuring any element.
STEP 2 — ZERO-HALLUCINATION INVENTORY EXTRACTION:
- Extract ONLY physical vessels, branches, flower stems, foliage, and stones/twigs visibly present in the photo(s). Do NOT list the ruler itself.`;

    const prompt = `You are a master Ikebana structural architect and botanical photogrammetry analyst.

${activeSchoolRule}

${inventoryInstruction}

STEP 3 — THREE ZERO-KENZAN ARRANGEMENT BLUEPRINTS UNDER THIS SCHOOL'S AESTHETIC:
- Generate 3 compositions ("moribana-slanted", "moribana-upright", "jiyuka-freestyle") using ONLY the detected/verified items and organic anchoring (stones, Komidome forked-twig wedges, Juji-dome cross-splits, or rim tension).
- Reflect the selected school's specific structural laws in every styleTitle, anchor setup, cut length, and placement angle.
- Include 4–5 sequential steps per style with millimeter Mizukiri underwater cuts, hand-warmed Tameru bending guidance, and placementAngles starting with the tilt degree (e.g., "45° forward tilt, 30° left azimuth").`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }, ...imageParts] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: inventoryAnalysisSchema,
        temperature: 0.35,
      },
    });

    if (!response.text) {
      throw new Error('Empty response returned from Gemini Vision.');
    }

    return NextResponse.json(JSON.parse(response.text));
  } catch (error: unknown) {
    console.error('Error in /api/analyze-inventory:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to analyze botanical inventory.',
      },
      { status: 500 }
    );
  }
}
