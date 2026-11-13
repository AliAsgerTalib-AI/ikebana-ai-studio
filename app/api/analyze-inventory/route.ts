import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';

export const maxDuration = 60;

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

    const ai = new GoogleGenAI({ apiKey });

    const { images } = await req.json();
    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: 'At least one material photo is required.' },
        { status: 400 }
      );
    }

    const imageParts = images.map(
      (img: { base64: string; mimeType?: string }) => ({
        inlineData: {
          data: img.base64.includes(',')
            ? img.base64.split(',')[1]
            : img.base64,
          mimeType: img.mimeType || 'image/jpeg',
        },
      })
    );

    const prompt = `You are a master Ikebana structural architect and botanical photogrammetry analyst.

STEP 1 — REFERENCE SCALE CALIBRATION:
- Check if a ruler, measuring tape, or grid mat is visible in the photo(s).
- If a ruler is present, calibrate pixel-to-millimeter scale directly from its visible graduations before measuring any botanical element or vessel.
- If no ruler is visible, estimate realistic proportions conservatively.

STEP 2 — ZERO-HALLUCINATION INVENTORY EXTRACTION:
- Extract ONLY physical vessels, branches, flower stems, foliage, and stones/twigs visibly present in the photo(s). Do NOT list the ruler itself as a botanical item.
- Record millimeter dimensions, natural curvature in degrees, and structural roles (vessel, shin, soe, hikae, anchor, foliage).

STEP 3 — THREE ZERO-KENZAN ARRANGEMENT BLUEPRINTS:
- Generate 3 compositions ("moribana-slanted", "moribana-upright", "jiyuka-freestyle") using ONLY detected items and organic anchoring (stones, Komidome forked-twig wedges, Juji-dome cross-splits, or rim tension).
- Ensure Shin length respects classical vessel proportions (~1.5x vessel diameter + height) based on calibrated measurements.
- Include 4-5 sequential steps per style with millimeter Mizukiri underwater cuts, hand-warmed Tameru bending guidance, and placementAngles starting with the tilt degree (e.g., "45° forward tilt, 30° left azimuth").`;

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
