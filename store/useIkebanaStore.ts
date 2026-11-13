import { create } from 'zustand';

export interface UploadedImage {
  base64: string;
  mimeType: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  role: 'vessel' | 'shin' | 'soe' | 'hikae' | 'anchor' | 'foliage';
  dimensions: string;
  naturalCurvatureDegrees: number;
  notes?: string;
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
  uploadedImages: UploadedImage[];
  inventory: InventoryItem[];
  arrangements: ArrangementOption[];
  selectedStyleId: ArrangementOption['styleId'];
  activeStep: number;
  activeStepIndex: number;
  renderedPreviewUrl: string | null;

  setUploadedImages: (images: UploadedImage[]) => void;
  setAnalysisResult: (items: InventoryItem[], arrangements: ArrangementOption[]) => void;
  removeInventoryItem: (id: string) => void;
  selectStyle: (styleId: ArrangementOption['styleId']) => void;
  setActiveStep: (index: number) => void;
  setActiveStepIndex: (index: number) => void;
  setRenderedPreviewUrl: (url: string | null) => void;
  resetSession: () => void;
}

export const useIkebanaStore = create<IkebanaState>((set) => ({
  uploadedImages: [],
  inventory: [],
  arrangements: [],
  selectedStyleId: 'moribana-slanted',
  activeStep: 0,
  activeStepIndex: 0,
  renderedPreviewUrl: null,

  setUploadedImages: (images) => set({ uploadedImages: images }),

  setAnalysisResult: (items, arrangements) =>
    set({
      inventory: items,
      arrangements,
      selectedStyleId: arrangements[0]?.styleId ?? 'moribana-slanted',
      activeStep: 0,
      activeStepIndex: 0,
      renderedPreviewUrl: null,
    }),

  removeInventoryItem: (id) =>
    set((state) => ({
      inventory: state.inventory.filter((item) => item.id !== id),
      renderedPreviewUrl: null,
    })),

  selectStyle: (styleId) =>
    set((state) => ({
      selectedStyleId: styleId,
      activeStep: 0,
      activeStepIndex: 0,
      renderedPreviewUrl: state.selectedStyleId === styleId ? state.renderedPreviewUrl : null,
    })),

  setActiveStep: (index) => set({ activeStep: index, activeStepIndex: index }),

  setActiveStepIndex: (index) => set({ activeStep: index, activeStepIndex: index }),

  setRenderedPreviewUrl: (url) => set({ renderedPreviewUrl: url }),

  resetSession: () =>
    set({
      uploadedImages: [],
      inventory: [],
      arrangements: [],
      selectedStyleId: 'moribana-slanted',
      activeStep: 0,
      activeStepIndex: 0,
      renderedPreviewUrl: null,
    }),
}));
