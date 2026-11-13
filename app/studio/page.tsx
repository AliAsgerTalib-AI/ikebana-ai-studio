'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Brush,
  Camera,
  Anchor,
  Compass,
  Clock,
  Layers,
  AlertCircle,
} from 'lucide-react';
import {
  useIkebanaStore,
  ArrangementOption,
  InventoryItem,
} from '@/store/useIkebanaStore';

// Fallback blueprints if user navigates directly to /studio before uploading photos
const FALLBACK_ARRANGEMENTS: ArrangementOption[] = [
  {
    styleId: 'moribana-slanted',
    styleTitle: 'Moribana Slanted Form (Keishatai)',
    difficulty: 'Beginner',
    stabilityScore: '94% Anchored',
    diyAnchorMechanism: {
      methodName: 'River-Stone & Forked-Twig Wedge (Komidome)',
      materialsUsed: ['Flat River Stones', 'Forked Hardwood Crossbar'],
      setupInstructions:
        'Wedge a forked branch across the inner basin rim 15mm below water level, locking the Shin stem base against two heavy river stones.',
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Establish Shin (Primary Heaven Line)',
        estimatedMinutes: 4,
        requiredTools: ['Hasami Shears'],
        description:
          'Cut the longest woody branch to 1.5x vessel diameter + height. Slant forward-left at 45°.',
        mizukiriCutSpec: '45° underwater diagonal cut, 320mm total length',
        tameruTechnique: 'Warm-hand gentle arc curve +15° toward viewer',
        placementAngles: '45° forward tilt, 30° left azimuth',
      },
    ],
  },
  {
    styleId: 'moribana-upright',
    styleTitle: 'Moribana Upright Form (Chokuritsutai)',
    difficulty: 'Intermediate',
    stabilityScore: '91% Anchored',
    diyAnchorMechanism: {
      methodName: 'Cross-Split Stem Base (Jūji-dome)',
      materialsUsed: ['Thick Primary Stem', 'Counterweight Pebble'],
      setupInstructions:
        'Split the bottom 25mm of the primary stem into four quadrants and splay open over a flat river pebble to form a tripod.',
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Anchor Vertical Shin Axis',
        estimatedMinutes: 5,
        requiredTools: ['Hasami Shears'],
        description:
          'Position Shin nearly vertical (10° off plumb) in the rear-left quadrant of the basin.',
        mizukiriCutSpec: 'Flat base with 25mm 4-way split, 340mm length',
        tameruTechnique: 'Straighten lower 100mm node for vertical poise',
        placementAngles: '10° forward tilt, 15° left azimuth',
      },
    ],
  },
  {
    styleId: 'jiyuka-freestyle',
    styleTitle: 'Jiyūka Sculptural Freestyle',
    difficulty: 'Advanced',
    stabilityScore: '88% Anchored',
    diyAnchorMechanism: {
      methodName: 'Tension-Bridge Counterbalance',
      materialsUsed: ['Curved Secondary Branch', 'Basin Rim Lip'],
      setupInstructions:
        'Use the natural S-curve of your secondary branch to brace against opposite interior walls of the vessel.',
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Construct Tension Frame',
        estimatedMinutes: 6,
        requiredTools: ['Hasami Shears'],
        description:
          'Lock the curved branch across the vessel mouth to create an elevated fulcrum for focal blooms.',
        mizukiriCutSpec: 'Notched 30° bevel ends to grip ceramic wall',
        tameruTechnique: 'Compress outer bark fibers gently to accentuate S-curve',
        placementAngles: '65° horizontal sweep across water plane',
      },
    ],
  },
];

export default function StudioPage() {
  const router = useRouter();

  const {
    uploadedImages,
    inventory,
    arrangements,
    selectedStyleId,
    setSelectedStyleId,
    setActiveStep,
  } = useIkebanaStore();

  const [renderMode, setRenderMode] = useState<'realistic' | 'sumi-e'>('realistic');

  const activeArrangements =
    arrangements.length > 0 ? arrangements : FALLBACK_ARRANGEMENTS;

  const currentPlan = useMemo(() => {
    return (
      activeArrangements.find((a) => a.styleId === selectedStyleId) ||
      activeArrangements[0]
    );
  }, [activeArrangements, selectedStyleId]);

  const shinItem = inventory.find((i: InventoryItem) => i.role === 'shin');
  const soeItem = inventory.find((i: InventoryItem) => i.role === 'soe');
  const hikaeItem = inventory.find((i: InventoryItem) => i.role === 'hikae');
  const vesselItem = inventory.find((i: InventoryItem) => i.role === 'vessel');

  const totalMinutes = useMemo(() => {
    if (!currentPlan?.steps?.length) return 12;
    return currentPlan.steps.reduce(
      (sum, step) => sum + (step.estimatedMinutes || 3),
      0
    );
  }, [currentPlan]);

  // Dynamic angles for the SVG blueprint based on selected style
  const vectorAngles = useMemo(() => {
    if (currentPlan.styleId === 'moribana-upright') {
      return {
        shinPath: 'M 145 215 Q 140 125 130 42',
        soePath: 'M 145 215 Q 112 155 82 108',
        hikaePath: 'M 145 215 Q 182 182 218 162',
        shinLabel: 'Shin (10°)',
        soeLabel: 'Soe (40°)',
        hikaeLabel: 'Hikae (65°)',
      };
    }
    if (currentPlan.styleId === 'jiyuka-freestyle') {
      return {
        shinPath: 'M 145 215 Q 190 140 232 68',
        soePath: 'M 145 215 Q 95 178 52 142',
        hikaePath: 'M 145 215 Q 142 162 158 118',
        shinLabel: 'Primary Arc (60°)',
        soeLabel: 'Counter-Line (75°)',
        hikaeLabel: 'Focal Core (20°)',
      };
    }
    // Default: moribana-slanted
    return {
      shinPath: 'M 145 215 Q 115 135 88 52',
      soePath: 'M 145 215 Q 100 175 58 140',
      hikaePath: 'M 145 215 Q 186 184 226 168',
      shinLabel: 'Shin (45°)',
      soeLabel: 'Soe (65°)',
      hikaeLabel: 'Hikae (75°)',
    };
  }, [currentPlan.styleId]);

  const handleProceedToWorkbench = () => {
    setActiveStep(1);
    router.push('/workbench');
  };

  return (
    <div className="bg-surface-base text-text-primary antialiased min-h-screen flex flex-col font-body-regular selection:bg-primary-fixed max-w-[430px] mx-auto w-full relative shadow-xl border-x border-border-hairline/60">
      {/* Sticky Top App Bar */}
      <header className="sticky top-0 w-full z-40 pt-safe bg-surface-base/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-border-hairline/40">
        <div className="h-14 px-margin flex items-center justify-between">
          <button
            aria-label="Back to Inventory"
            type="button"
            onClick={() => router.push('/inventory')}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-text-primary hover:bg-surface-container active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="font-serif text-[17px] font-semibold tracking-tight text-text-primary">
            生け花 · Composition
          </h1>

          <span className="font-label-micro text-[11px] font-semibold text-accent-moss bg-primary-fixed/80 px-2.5 py-1 rounded-full">
            Step 2 of 3: Studio
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-margin pt-4 pb-36 gap-5">
        {/* Empty Inventory Notice (if opened directly) */}
        {inventory.length === 0 && (
          <div className="bg-surface-container-low border border-border-hairline rounded-xl p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-text-muted text-[12px]">
              <AlertCircle className="w-4 h-4 text-accent-moss shrink-0" />
              <span>Previewing sample geometry. Upload photos for custom material mapping.</span>
            </div>
            <button
              type="button"
              onClick={() => router.push('/inventory')}
              className="text-[11px] font-semibold text-accent-moss underline shrink-0 cursor-pointer"
            >
              Upload
            </button>
          </div>
        )}

        {/* Style Variation Carousel Chips */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label-micro text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Select Classical Form ({activeArrangements.length})
            </span>
            <span className="font-label-micro text-[11px] text-accent-moss font-medium">
              {currentPlan.difficulty} · {currentPlan.stabilityScore}
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {activeArrangements.map((option) => {
              const isSelected = option.styleId === currentPlan.styleId;
              return (
                <button
                  key={option.styleId}
                  type="button"
                  onClick={() => setSelectedStyleId(option.styleId)}
                  className={`px-3.5 py-2.5 rounded-2xl border text-left transition-all shrink-0 max-w-[210px] cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-on-primary border-primary shadow-sm'
                      : 'bg-surface-card text-text-primary border-border-hairline hover:bg-surface-container-low'
                  }`}
                >
                  <p className="font-body-small text-[12px] font-semibold leading-snug line-clamp-1">
                    {option.styleTitle}
                  </p>
                  <p
                    className={`font-label-micro text-[10px] mt-0.5 ${
                      isSelected ? 'text-primary-fixed' : 'text-text-muted'
                    }`}
                  >
                    {option.steps?.length || 4} Steps · {option.difficulty}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Dual-Mode Preview Stage: Realistic Composite vs. Sumi-e Ink */}
        <section className="relative rounded-3xl overflow-hidden border border-border-hairline bg-surface-card shadow-sm">
          {/* Top Mode Toggle Pill */}
          <div className="p-3 flex items-center justify-between border-b border-border-hairline/60 bg-surface-base/70">
            <div className="inline-flex rounded-full bg-surface-container p-1 border border-border-hairline/60">
              <button
                type="button"
                onClick={() => setRenderMode('realistic')}
                className={`px-3 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  renderMode === 'realistic'
                    ? 'bg-surface-card text-text-primary shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-accent-moss" />
                <span>Realistic Composite</span>
              </button>

              <button
                type="button"
                onClick={() => setRenderMode('sumi-e')}
                className={`px-3 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  renderMode === 'sumi-e'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <Brush className="w-3.5 h-3.5" />
                <span>Sumi-e Ink</span>
              </button>
            </div>

            <span className="font-label-micro text-[10px] font-semibold text-text-muted uppercase tracking-wider">
              {renderMode === 'realistic' ? 'Photo + Vector' : 'Asymmetric Ma'}
            </span>
          </div>

          {/* Visual Canvas */}
          <div
            className={`relative h-[290px] w-full flex items-center justify-center overflow-hidden transition-colors duration-300 ${
              renderMode === 'sumi-e' ? 'bg-[#F4F1EA]' : 'bg-surface-container-low'
            }`}
          >
            {/* Background Material Photo in Realistic Mode */}
            {renderMode === 'realistic' && uploadedImages[0]?.base64 && (
              <img
                src={uploadedImages[0].base64}
                alt="Your botanical materials"
                className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-multiply"
              />
            )}

            {/* Washi Paper Texture Grid in Sumi-e Mode */}
            {renderMode === 'sumi-e' && (
              <div
                className="absolute inset-0 opacity-35 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(#8C857B 0.75px, transparent 0.75px)',
                  backgroundSize: '18px 18px',
                }}
              />
            )}

            {/* Ikebana Scalene Triangle Vector & Ink Overlay */}
            <svg
              viewBox="0 0 290 260"
              className="relative z-10 w-full h-full max-w-[320px]"
            >
              {/* Subtle Ma (Negative Space) Triangle Guide */}
              <polygon
                points={
                  currentPlan.styleId === 'moribana-upright'
                    ? '130,42 82,108 218,162'
                    : currentPlan.styleId === 'jiyuka-freestyle'
                    ? '232,68 52,142 158,118'
                    : '88,52 58,140 226,168'
                }
                fill={
                  renderMode === 'sumi-e'
                    ? 'rgba(45, 62, 50, 0.05)'
                    : 'rgba(208, 233, 211, 0.28)'
                }
                stroke={renderMode === 'sumi-e' ? '#8C857B' : '#3E5343'}
                strokeWidth="1"
                strokeDasharray="4 4"
              />

              {/* Vessel / Suiban Silhouette */}
              <path
                d="M 85 215 L 205 215 L 192 238 L 98 238 Z"
                fill={renderMode === 'sumi-e' ? '#2A2927' : '#3E5343'}
                opacity={renderMode === 'sumi-e' ? 0.88 : 0.85}
              />
              {/* Water Surface Line */}
              <line
                x1="90"
                y1="213"
                x2="200"
                y2="213"
                stroke={renderMode === 'sumi-e' ? '#6C6B66' : '#7FA389'}
                strokeWidth="1.5"
              />

              {/* Shin (Primary Heaven Line) */}
              <path
                d={vectorAngles.shinPath}
                fill="none"
                stroke={renderMode === 'sumi-e' ? '#1A1B19' : '#2D3E32'}
                strokeWidth={renderMode === 'sumi-e' ? '4.5' : '3.5'}
                strokeLinecap="round"
              />

              {/* Soe (Secondary Man Line) */}
              <path
                d={vectorAngles.soePath}
                fill="none"
                stroke={renderMode === 'sumi-e' ? '#3A3935' : '#4E6B56'}
                strokeWidth={renderMode === 'sumi-e' ? '3.5' : '2.8'}
                strokeLinecap="round"
              />

              {/* Hikae (Tertiary Earth Line) */}
              <path
                d={vectorAngles.hikaePath}
                fill="none"
                stroke={renderMode === 'sumi-e' ? '#575550' : '#BD4B37'}
                strokeWidth={renderMode === 'sumi-e' ? '3' : '2.5'}
                strokeLinecap="round"
              />

              {/* Focal Bloom Accent */}
              <circle
                cx={currentPlan.styleId === 'jiyuka-freestyle' ? '158' : '152'}
                cy="185"
                r="9"
                fill="#BD4B37"
                opacity={renderMode === 'sumi-e' ? 0.78 : 0.92}
              />

              {/* Anchor Point Marker */}
              <circle
                cx="145"
                cy="215"
                r="4.5"
                fill="#F8F7F4"
                stroke="#1A1B19"
                strokeWidth="2"
              />

              {/* Role Callout Labels */}
              <text
                x="14"
                y="34"
                className="text-[10px] font-semibold fill-text-primary"
              >
                {vectorAngles.shinLabel}
              </text>
              <text
                x="14"
                y="130"
                className="text-[10px] font-medium fill-text-muted"
              >
                {vectorAngles.soeLabel}
              </text>
              <text
                x="202"
                y="154"
                className="text-[10px] font-medium fill-accent-vermilion"
              >
                {vectorAngles.hikaeLabel}
              </text>
            </svg>

            {/* Bottom Ma (Negative Space) Caption */}
            <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between text-[11px] bg-surface-card/90 backdrop-blur-xs px-3 py-1.5 rounded-full border border-border-hairline/70">
              <span className="font-medium text-text-primary flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-accent-moss" />
                <span>{currentPlan.styleTitle}</span>
              </span>
              <span className="font-label-micro text-text-muted">
                ~{totalMinutes} min
              </span>
            </div>
          </div>
        </section>

        {/* DIY Organic Anchor Mechanism Card (Zero-Kenzan Architecture) */}
        <section className="bg-surface-card rounded-2xl p-4 border border-border-hairline shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-label-micro text-[11px] font-semibold uppercase tracking-wider text-accent-moss flex items-center gap-1.5">
              <Anchor className="w-3.5 h-3.5" />
              <span>Zero-Kenzan Anchor Strategy</span>
            </span>
            <span className="font-label-micro text-[10px] bg-primary-fixed/80 text-accent-moss px-2 py-0.5 rounded-full font-semibold">
              {currentPlan.stabilityScore}
            </span>
          </div>

          <h3 className="font-serif text-[16px] font-semibold text-text-primary">
            {currentPlan.diyAnchorMechanism.methodName}
          </h3>

          <p className="font-body-small text-[13px] text-on-surface-variant leading-relaxed">
            {currentPlan.diyAnchorMechanism.setupInstructions}
          </p>

          {currentPlan.diyAnchorMechanism.materialsUsed?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {currentPlan.diyAnchorMechanism.materialsUsed.map((mat, i) => (
                <span
                  key={i}
                  className="font-label-micro text-[11px] bg-surface-container-low text-text-primary px-2.5 py-1 rounded-full border border-border-hairline/70"
                >
                  {mat}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Assigned Botanical Roles Summary */}
        <section className="bg-surface-card rounded-2xl p-4 border border-border-hairline shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-subheading-h3 text-[14px] font-semibold text-text-primary flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-accent-moss" />
              <span>Assigned Structural Roles</span>
            </h3>
            <span className="font-label-micro text-[11px] text-text-muted">
              {inventory.length > 0 ? `${inventory.length} elements` : 'Sample set'}
            </span>
          </div>

          <div className="divide-y divide-border-hairline/60 text-[12px]">
            <div className="py-2 flex items-center justify-between">
              <span className="font-semibold text-accent-moss">Shin (Heaven)</span>
              <span className="text-text-primary font-medium">
                {shinItem ? `${shinItem.name} (${shinItem.dimensions})` : 'Primary Tall Branch'}
              </span>
            </div>
            <div className="py-2 flex items-center justify-between">
              <span className="font-semibold text-text-primary">Soe (Man)</span>
              <span className="text-text-primary font-medium">
                {soeItem ? `${soeItem.name} (${soeItem.dimensions})` : 'Secondary Mid-Stem'}
              </span>
            </div>
            <div className="py-2 flex items-center justify-between">
              <span className="font-semibold text-accent-vermilion">Hikae (Earth)</span>
              <span className="text-text-primary font-medium">
                {hikaeItem ? `${hikaeItem.name} (${hikaeItem.dimensions})` : 'Low Focal Accent'}
              </span>
            </div>
            <div className="py-2 flex items-center justify-between">
              <span className="font-semibold text-text-muted">Vessel</span>
              <span className="text-text-primary font-medium">
                {vesselItem ? `${vesselItem.name} (${vesselItem.dimensions})` : 'Low Basin / Bowl'}
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Bottom Action Dock */}
      <aside className="fixed bottom-0 inset-x-0 z-40 bg-surface-base/90 backdrop-blur-md px-margin py-3 pb-safe border-t border-border-hairline/70 max-w-[430px] mx-auto">
        <div className="flex items-center justify-between text-[11px] text-text-muted mb-2 px-1">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-accent-moss" />
            <span>{currentPlan.steps?.length || 4} guided fabrication steps</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Est. {totalMinutes} mins</span>
          </span>
        </div>

        <button
          type="button"
          onClick={handleProceedToWorkbench}
          className="w-full h-[52px] rounded-full bg-primary hover:bg-accent-moss text-on-primary font-body-small text-[14px] font-semibold shadow-sm flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
        >
          <span>Begin Tactile Workbench</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </aside>
    </div>
  );
}
