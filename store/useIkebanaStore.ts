import { create } from 'zustand';

export interface InventoryItem {
  id: string;
  name: string;
  role: 'vessel' | 'shin' | 'soe' | 'hikae' | 'anchor' | 'foliage';
  dimensions: string;
  naturalCurvatureDegrees: number;
  notes: string;
  imageUrl?: string;
}

export interface ArrangementStep {
  stepNumber: number;
  title: string;
  estimatedMinutes: number;
  requiredTools: string[];
  description: string;
  mizukiriCutSpec: string;
  tameruTechnique: string;
  placementAngles: string;
}

export interface ArrangementOption {
  styleId: 'moribana-slanted' | 'moribana-upright' | 'jiyuka-freestyle';
  styleTitle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  stabilityScore: string;
  diyAnchorMechanism: {
    methodName: string;
    materialsUsed: string[];
    setupInstructions: string;
  };
  steps: ArrangementStep[];
}

interface IkebanaState {
  uploadedImages: { base64: string; mimeType: string }[];
  inventory: InventoryItem[];
  arrangements: ArrangementOption[];
  selectedStyleId: string;
  activeStep: number;
  setUploadedImages: (imgs: { base64: string; mimeType: string }[]) => void;
  setAnalysisResult: (items: InventoryItem[], arrangements: ArrangementOption[]) => void;
  removeInventoryItem: (id: string) => void;
  setSelectedStyleId: (styleId: string) => void;
  setActiveStep: (step: number) => void;
}

export const useIkebanaStore = create<IkebanaState>((set) => ({
  uploadedImages: [],
  inventory: [],
  arrangements: [],
  selectedStyleId: 'moribana-slanted',
  activeStep: 1,
  setUploadedImages: (imgs) => set({ uploadedImages: imgs }),
  setAnalysisResult: (items, arrangements) =>
    set({
      inventory: items,
      arrangements,
      selectedStyleId: arrangements[0]?.styleId || 'moribana-slanted',
      activeStep: 1,
    }),
  removeInventoryItem: (id) =>
    set((state) => ({
      inventory: state.inventory.filter((item) => item.id !== id),
    })),
  setSelectedStyleId: (styleId) => set({ selectedStyleId: styleId }),
  setActiveStep: (step) => set({ activeStep: step }),
}));
