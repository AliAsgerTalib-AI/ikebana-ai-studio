'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Compass, RotateCcw, Check, Sliders } from 'lucide-react';
import { ArrangementOption, InventoryItem } from '@/store/useIkebanaStore';

type StemKey = 'shin' | 'soe' | 'hikae';

interface StemParams {
  lengthMm: number;
  tiltDeg: number;     // 0° = straight vertical, 85° = nearly horizontal
  azimuthDeg: number;  // -120° (left) to +120° (right), 0° = straight forward toward viewer
}

interface TriangleAzimuthSandboxProps {
  plan: ArrangementOption;
  inventory: InventoryItem[];
  onCommit: (updatedPlan: ArrangementOption) => void;
}

function parseFirstNumber(text: string | undefined, fallback: number): number {
  if (!text) return fallback;
  const match = text.match(/(\d+(?:\.\d+)?)/);
  return match ? Math.round(parseFloat(match[1])) : fallback;
}

function parseVesselDims(vessel?: InventoryItem): { widthMm: number; heightMm: number } {
  if (!vessel?.dimensions) return { widthMm: 220, heightMm: 65 };
  const nums = vessel.dimensions.match(/\d+(?:\.\d+)?/g)?.map(Number) || [];
  if (nums.length >= 2) {
    const isHeightFirst = /height|tall/i.test(vessel.dimensions.split(/[×x,]/)[0] || '');
    return isHeightFirst
      ? { heightMm: Math.round(nums[0]), widthMm: Math.round(nums[1]) }
      : { widthMm: Math.round(nums[0]), heightMm: Math.round(nums[1]) };
  }
  if (nums.length === 1) {
    return { widthMm: Math.round(nums[0]), heightMm: 70 };
  }
  return { widthMm: 220, heightMm: 65 };
}

function deriveInitialStems(
  plan: ArrangementOption,
  inventory: InventoryItem[]
): Record<StemKey, StemParams> {
  const shinItem = inventory.find((i) => i.role === 'shin');
  const soeItem = inventory.find((i) => i.role === 'soe');
  const hikaeItem = inventory.find((i) => i.role === 'hikae');

  const stepText = plan.steps
    .map((s) => `${s.title} ${s.mizukiriCutSpec} ${s.placementAngles}`)
    .join(' | ');

  const shinStep = plan.steps.find((s) => /shin|primary|heaven/i.test(s.title)) || plan.steps[1];
  const soeStep = plan.steps.find((s) => /soe|secondary|man/i.test(s.title)) || plan.steps[2];
  const hikaeStep = plan.steps.find((s) => /hikae|tertiary|earth|focal/i.test(s.title)) || plan.steps[3];

  const defaultShinTilt =
    plan.styleId === 'moribana-upright' ? 15 : plan.styleId === 'jiyuka-freestyle' ? 58 : 42;

  const shinLen = parseFirstNumber(
    shinStep?.mizukiriCutSpec,
    parseFirstNumber(shinItem?.dimensions, 350)
  );
  const soeLen = parseFirstNumber(
    soeStep?.mizukiriCutSpec,
    parseFirstNumber(soeItem?.dimensions, Math.round(shinLen * 0.67))
  );
  const hikaeLen = parseFirstNumber(
    hikaeStep?.mizukiriCutSpec,
    parseFirstNumber(hikaeItem?.dimensions, Math.round(shinLen * 0.38))
  );

  const shinTilt = Math.min(82, Math.max(5, parseFirstNumber(shinStep?.placementAngles, defaultShinTilt)));
  const soeTilt = Math.min(82, Math.max(15, parseFirstNumber(soeStep?.placementAngles, 62)));
  const hikaeTilt = Math.min(85, Math.max(25, parseFirstNumber(hikaeStep?.placementAngles, 74)));

  void stepText;

  return {
    shin: { lengthMm: shinLen, tiltDeg: shinTilt, azimuthDeg: -30 },
    soe: { lengthMm: soeLen, tiltDeg: soeTilt, azimuthDeg: -65 },
    hikae: { lengthMm: hikaeLen, tiltDeg: hikaeTilt, azimuthDeg: 50 },
  };
}

const STEM_META: Record<
  StemKey,
  { label: string; kanji: string; color: string; bgChip: string }
> = {
  shin: {
    label: 'Shin',
    kanji: '真 · Heaven',
    color: '#2F5233',
    bgChip: 'bg-primary text-on-primary',
  },
  soe: {
    label: 'Soe',
    kanji: '副 · Man',
    color: '#5C7A60',
    bgChip: 'bg-accent-moss text-on-primary',
  },
  hikae: {
    label: 'Hikae',
    kanji: '控 · Earth',
    color: '#BD4B37',
    bgChip: 'bg-accent-vermilion text-on-primary',
  },
};

export default function TriangleAzimuthSandbox({
  plan,
  inventory,
  onCommit,
}: TriangleAzimuthSandboxProps) {
  const vesselDims = useMemo(
    () => parseVesselDims(inventory.find((i) => i.role === 'vessel')),
    [inventory]
  );

  const initialStems = useMemo(
    () => deriveInitialStems(plan, inventory),
    [plan, inventory]
  );

  const [stems, setStems] = useState<Record<StemKey, StemParams>>(initialStems);
  const [activeStem, setActiveStem] = useState<StemKey>('shin');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [justCommitted, setJustCommitted] = useState<boolean>(false);

  useEffect(() => {
    setStems(initialStems);
    setHasUnsavedChanges(false);
    setJustCommitted(false);
  }, [initialStems]);

  const updateStem = (key: StemKey, patch: Partial<StemParams>) => {
    setStems((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch },
    }));
    setHasUnsavedChanges(true);
    setJustCommitted(false);
  };

  const handleReset = () => {
    setStems(initialStems);
    setHasUnsavedChanges(false);
    setJustCommitted(false);
  };

  const handleCommit = () => {
    const updatedSteps = plan.steps.map((step) => {
      const isShin = /shin|primary|heaven/i.test(step.title) || step.stepNumber === 2;
      const isSoe = /soe|secondary|man/i.test(step.title) || step.stepNumber === 3;
      const isHikae =
        /hikae|tertiary|earth|focal/i.test(step.title) || step.stepNumber === 4;

      if (isShin && !isSoe && !isHikae) {
        const s = stems.shin;
        const dir = s.azimuthDeg < 0 ? `${Math.abs(s.azimuthDeg)}° left` : `${s.azimuthDeg}° right`;
        return {
          ...step,
          mizukiriCutSpec: `45° underwater diagonal cut, ${s.lengthMm}mm total length`,
          placementAngles: `${s.tiltDeg}° tilt from vertical, ${dir} azimuth`,
        };
      }
      if (isSoe) {
        const s = stems.soe;
        const dir = s.azimuthDeg < 0 ? `${Math.abs(s.azimuthDeg)}° left` : `${s.azimuthDeg}° right`;
        return {
          ...step,
          mizukiriCutSpec: `45° underwater diagonal cut, ${s.lengthMm}mm total length`,
          placementAngles: `${s.tiltDeg}° tilt from vertical, ${dir} azimuth`,
        };
      }
      if (isHikae) {
        const s = stems.hikae;
        const dir = s.azimuthDeg < 0 ? `${Math.abs(s.azimuthDeg)}° left` : `${s.azimuthDeg}° right`;
        return {
          ...step,
          mizukiriCutSpec: `45° underwater diagonal cut, ${s.lengthMm}mm total length`,
          placementAngles: `${s.tiltDeg}° tilt from vertical, ${dir} azimuth`,
        };
      }
      return step;
    });

    onCommit({
      ...plan,
      steps: updatedSteps,
    });
    setHasUnsavedChanges(false);
    setJustCommitted(true);
  };

  // Classical Moribana proportion benchmark
  const classicalShinTarget = vesselDims.widthMm + vesselDims.heightMm;
  const shinRatio = stems.shin.lengthMm / Math.max(100, classicalShinTarget);
  const soeRatio = stems.soe.lengthMm / Math.max(50, stems.shin.lengthMm);
  const hikaeRatio = stems.hikae.lengthMm / Math.max(50, stems.shin.lengthMm);

  const isBalancedScalene =
    stems.shin.lengthMm > stems.soe.lengthMm &&
    stems.soe.lengthMm > stems.hikae.lengthMm &&
    Math.abs(stems.shin.azimuthDeg - stems.hikae.azimuthDeg) >= 45;

  // --- Side Elevation Projection (165 x 165 SVG) ---
  const sideScale = 0.25; // 1mm -> 0.25px (400mm = 100px)
  const vesselPxW = Math.min(96, Math.max(34, vesselDims.widthMm * sideScale));
  const vesselPxH = Math.min(58, Math.max(16, vesselDims.heightMm * sideScale));
  const groundY = 148;
  const anchorX = 82 - vesselPxW * 0.18;
  const anchorY = groundY - vesselPxH + 4;

  const projectSide = (p: StemParams) => {
    const radTilt = (p.tiltDeg * Math.PI) / 180;
    const radAz = (p.azimuthDeg * Math.PI) / 180;
    const lenPx = Math.min(115, Math.max(24, p.lengthMm * sideScale));
    const horizontalReach = lenPx * Math.sin(radTilt) * Math.sin(radAz);
    const verticalRise = lenPx * Math.cos(radTilt);
    return {
      x: Math.max(10, Math.min(155, anchorX + horizontalReach)),
      y: Math.max(12, Math.min(groundY - 4, anchorY - verticalRise)),
    };
  };

  const sideShin = projectSide(stems.shin);
  const sideSoe = projectSide(stems.soe);
  const sideHikae = projectSide(stems.hikae);

  // --- Top-Down Azimuth Projection (165 x 165 SVG) ---
  const topCenter = { x: 82, y: 78 };
  const rimRadius = Math.min(34, Math.max(18, (vesselDims.widthMm * 0.22) / 2));
  const topAnchor = { x: topCenter.x - rimRadius * 0.28, y: topCenter.y - rimRadius * 0.18 };

  const projectTop = (p: StemParams) => {
    const radTilt = (p.tiltDeg * Math.PI) / 180;
    const radAz = (p.azimuthDeg * Math.PI) / 180;
    // Horizontal radial projection onto the XY plane
    const radialPx = Math.min(62, Math.max(14, p.lengthMm * 0.22 * Math.sin(radTilt)));
    // 0° azimuth points straight down (toward viewer at front of table)
    return {
      x: Math.max(12, Math.min(153, topAnchor.x + radialPx * Math.sin(radAz))),
      y: Math.max(12, Math.min(148, topAnchor.y + radialPx * Math.cos(radAz))),
    };
  };

  const topShin = projectTop(stems.shin);
  const topSoe = projectTop(stems.soe);
  const topHikae = projectTop(stems.hikae);

  const currentControl = stems[activeStem];

  return (
    <section className="rounded-3xl bg-surface-card border border-border-hairline p-4 shadow-xs flex flex-col gap-3.5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-accent-moss" />
          <h3 className="font-serif text-[15px] font-semibold text-text-primary">
            Triangle &amp; Azimuth Sandbox
          </h3>
        </div>
        <span
          className={`font-label-micro text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
            isBalancedScalene
              ? 'bg-primary-fixed/80 text-accent-moss'
              : 'bg-secondary-fixed/80 text-accent-vermilion'
          }`}
        >
          {isBalancedScalene ? 'Scalene Harmony' : 'Check Asymmetry'}
        </span>
      </div>

      {/* Dual Viewport: Side Elevation + Top-Down Azimuth */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Left: Front / Side Elevation */}
        <div className="rounded-2xl bg-surface-container-low/80 border border-border-hairline p-2 flex flex-col items-center">
          <span className="font-label-micro text-[9px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Front Elevation
          </span>
          <svg viewBox="0 0 165 165" className="w-full h-[145px]">
            {/* Plumb vertical axis */}
            <line
              x1={anchorX}
              y1={14}
              x2={anchorX}
              y2={anchorY}
              stroke="#C8C4BA"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
            {/* Table surface */}
            <line
              x1="14"
              y1={groundY}
              x2="151"
              y2={groundY}
              stroke="#B8B3A8"
              strokeWidth="1.5"
            />
            {/* Calibrated Vessel Silhouette */}
            <rect
              x={82 - vesselPxW / 2}
              y={groundY - vesselPxH}
              width={vesselPxW}
              height={vesselPxH}
              rx="4"
              fill="#E5E1D8"
              stroke="#8C877D"
              strokeWidth="1.2"
            />
            {/* Scalene Silhouette Triangle */}
            <polygon
              points={`${sideShin.x},${sideShin.y} ${sideSoe.x},${sideSoe.y} ${sideHikae.x},${sideHikae.y}`}
              fill={isBalancedScalene ? 'rgba(79, 111, 82, 0.10)' : 'rgba(189, 75, 55, 0.10)'}
              stroke={isBalancedScalene ? '#4F6F52' : '#BD4B37'}
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            {/* Stems */}
            <line
              x1={anchorX}
              y1={anchorY}
              x2={sideShin.x}
              y2={sideShin.y}
              stroke={STEM_META.shin.color}
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <line
              x1={anchorX}
              y1={anchorY}
              x2={sideSoe.x}
              y2={sideSoe.y}
              stroke={STEM_META.soe.color}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <line
              x1={anchorX}
              y1={anchorY}
              x2={sideHikae.x}
              y2={sideHikae.y}
              stroke={STEM_META.hikae.color}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            {/* Tip Nodes */}
            <circle cx={sideShin.x} cy={sideShin.y} r="3.5" fill={STEM_META.shin.color} />
            <circle cx={sideSoe.x} cy={sideSoe.y} r="3.2" fill={STEM_META.soe.color} />
            <circle cx={sideHikae.x} cy={sideHikae.y} r="3.2" fill={STEM_META.hikae.color} />
          </svg>
        </div>

        {/* Right: Top-Down Azimuth Compass */}
        <div className="rounded-2xl bg-surface-container-low/80 border border-border-hairline p-2 flex flex-col items-center">
          <span className="font-label-micro text-[9px] font-bold uppercase tracking-wider text-text-muted mb-1 flex items-center gap-1">
            <Compass className="w-2.5 h-2.5 text-accent-moss" />
            <span>Top Azimuth</span>
          </span>
          <svg viewBox="0 0 165 165" className="w-full h-[145px]">
            {/* Outer Compass Ring */}
            <circle
              cx={topCenter.x}
              cy={topCenter.y}
              r="58"
              fill="none"
              stroke="#DCD8CE"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
            {/* Vessel Rim Overhead */}
            <circle
              cx={topCenter.x}
              cy={topCenter.y}
              r={rimRadius}
              fill="#EAE6DD"
              stroke="#8C877D"
              strokeWidth="1.2"
            />
            {/* Front Viewer Indicator */}
            <text
              x={topCenter.x}
              y="157"
              textAnchor="middle"
              fontSize="8"
              fill="#7A756B"
              fontWeight="600"
            >
              FRONT (VIEWER)
            </text>
            {/* Overhead Scalene Triangle */}
            <polygon
              points={`${topShin.x},${topShin.y} ${topSoe.x},${topSoe.y} ${topHikae.x},${topHikae.y}`}
              fill={isBalancedScalene ? 'rgba(79, 111, 82, 0.14)' : 'rgba(189, 75, 55, 0.14)'}
              stroke={isBalancedScalene ? '#4F6F52' : '#BD4B37'}
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />
            {/* Radial Projections */}
            <line
              x1={topAnchor.x}
              y1={topAnchor.y}
              x2={topShin.x}
              y2={topShin.y}
              stroke={STEM_META.shin.color}
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <line
              x1={topAnchor.x}
              y1={topAnchor.y}
              x2={topSoe.x}
              y2={topSoe.y}
              stroke={STEM_META.soe.color}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <line
              x1={topAnchor.x}
              y1={topAnchor.y}
              x2={topHikae.x}
              y2={topHikae.y}
              stroke={STEM_META.hikae.color}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Overhead Tip Dots */}
            <circle cx={topShin.x} cy={topShin.y} r="3.5" fill={STEM_META.shin.color} />
            <circle cx={topSoe.x} cy={topSoe.y} r="3.2" fill={STEM_META.soe.color} />
            <circle cx={topHikae.x} cy={topHikae.y} r="3.2" fill={STEM_META.hikae.color} />
          </svg>
        </div>
      </div>

      {/* Live Classical Ratio Readout */}
      <div className="grid grid-cols-3 gap-1.5 text-center bg-surface-container-low/60 rounded-xl p-2 border border-border-hairline/60">
        <div>
          <span className="font-label-micro text-[9px] text-text-muted block">
            Shin / Vessel
          </span>
          <span className="font-body-small text-[11px] font-bold text-text-primary">
            {shinRatio.toFixed(2)}×{' '}
            <span className="font-normal text-text-muted">(~1.5×)</span>
          </span>
        </div>
        <div>
          <span className="font-label-micro text-[9px] text-text-muted block">
            Soe / Shin
          </span>
          <span className="font-body-small text-[11px] font-bold text-text-primary">
            {Math.round(soeRatio * 100)}%{' '}
            <span className="font-normal text-text-muted">(~67%)</span>
          </span>
        </div>
        <div>
          <span className="font-label-micro text-[9px] text-text-muted block">
            Hikae / Shin
          </span>
          <span className="font-body-small text-[11px] font-bold text-text-primary">
            {Math.round(hikaeRatio * 100)}%{' '}
            <span className="font-normal text-text-muted">(~35%)</span>
          </span>
        </div>
      </div>

      {/* Stem Selector Tabs */}
      <div className="grid grid-cols-3 gap-1.5">
        {(['shin', 'soe', 'hikae'] as StemKey[]).map((key) => {
          const isSelected = activeStem === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveStem(key)}
              className={`py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer border ${
                isSelected
                  ? `${STEM_META[key].bgChip} border-transparent shadow-2xs`
                  : 'bg-surface-container-low text-text-primary border-border-hairline hover:bg-surface-container'
              }`}
            >
              <span className="font-label-micro text-[11px] font-semibold block">
                {STEM_META[key].kanji}
              </span>
            </button>
          );
        })}
      </div>

      {/* Interactive Sliders for Selected Stem */}
      <div className="flex flex-col gap-2.5 pt-0.5">
        <label className="flex flex-col gap-1">
          <div className="flex justify-between font-label-micro text-[11px]">
            <span className="text-text-muted font-medium">Cut Length (Mizukiri)</span>
            <span className="font-bold text-text-primary">{currentControl.lengthMm} mm</span>
          </div>
          <input
            type="range"
            min={60}
            max={550}
            step={5}
            value={currentControl.lengthMm}
            onChange={(e) =>
              updateStem(activeStem, { lengthMm: Number(e.target.value) })
            }
            className="w-full accent-primary cursor-pointer"
          />
        </label>

        <label className="flex flex-col gap-1">
          <div className="flex justify-between font-label-micro text-[11px]">
            <span className="text-text-muted font-medium">Tilt From Vertical</span>
            <span className="font-bold text-text-primary">{currentControl.tiltDeg}°</span>
          </div>
          <input
            type="range"
            min={5}
            max={85}
            step={1}
            value={currentControl.tiltDeg}
            onChange={(e) =>
              updateStem(activeStem, { tiltDeg: Number(e.target.value) })
            }
            className="w-full accent-primary cursor-pointer"
          />
        </label>

        <label className="flex flex-col gap-1">
          <div className="flex justify-between font-label-micro text-[11px]">
            <span className="text-text-muted font-medium">Azimuth Spread (Left / Right)</span>
            <span className="font-bold text-text-primary">
              {currentControl.azimuthDeg === 0
                ? '0° Center'
                : currentControl.azimuthDeg < 0
                ? `${Math.abs(currentControl.azimuthDeg)}° Left`
                : `${currentControl.azimuthDeg}° Right`}
            </span>
          </div>
          <input
            type="range"
            min={-110}
            max={110}
            step={5}
            value={currentControl.azimuthDeg}
            onChange={(e) =>
              updateStem(activeStem, { azimuthDeg: Number(e.target.value) })
            }
            className="w-full accent-primary cursor-pointer"
          />
        </label>
      </div>

      {/* Action Footer: Reset or Commit Custom Angles */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border-hairline/60">
        <button
          type="button"
          onClick={handleReset}
          className="h-9 px-3 rounded-full bg-surface-container-low text-text-muted hover:text-text-primary font-label-micro text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>

        <button
          type="button"
          disabled={!hasUnsavedChanges && !justCommitted}
          onClick={handleCommit}
          className="h-9 px-4 rounded-full bg-primary hover:bg-accent-moss text-on-primary font-label-micro text-[11px] font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-45"
        >
          <Check className="w-3.5 h-3.5" />
          <span>
            {justCommitted ? 'Blueprint Updated' : 'Apply Angles to Blueprint'}
          </span>
        </button>
      </div>
    </section>
  );
}
