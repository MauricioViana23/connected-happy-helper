

# Plan: Integrate CEO-HUB into this Lovable Project

## What is CEO-HUB?
An executive health performance dashboard built with React + TypeScript. It has two views:
- **Patient View** (mobile-style): Shows an energy ring, executive mode, health drivers, and context cards
- **Doctor Dashboard** (desktop): Shows a grid of patients sorted by energy, with detailed drill-down panels

It uses mock data (no real backend), recharts for visualizations, and lucide-react for icons.

## Integration Strategy

The original repo has a flat structure (files at root level). We need to adapt it into this Lovable project's `src/` structure with `@/` path aliases.

### Files to Create

| Source File | Destination |
|---|---|
| `types.ts` | `src/types/ceohub.ts` |
| `constants.ts` | `src/constants/ceohub.ts` |
| `utils/engine.ts` | `src/utils/engine.ts` |
| `lib/db.ts` | `src/lib/db.ts` |
| `lib/api.ts` | `src/lib/api.ts` |
| `components/EnergyRing.tsx` | `src/components/ceohub/EnergyRing.tsx` |
| `components/DriverBar.tsx` | `src/components/ceohub/DriverBar.tsx` |
| `components/SplashScreen.tsx` | `src/components/ceohub/SplashScreen.tsx` |
| `views/PatientView.tsx` | `src/components/ceohub/PatientView.tsx` |
| `views/DoctorDashboard.tsx` | `src/components/ceohub/DoctorDashboard.tsx` |

### Files to Modify

1. **`src/pages/Index.tsx`** -- Replace placeholder with the CEO-HUB `App` component logic (view switcher between Patient and Doctor views)
2. **`src/index.css`** -- Add any needed global styles (dark background, custom scrollbar hiding)

### Dependencies

The project already has `lucide-react`. We need to add:
- `recharts` (used by EnergyRing component)

### Key Adaptations

- All import paths will be updated to use `@/` aliases (e.g., `'../types'` becomes `'@/types/ceohub'`)
- The `DriverBar` component references `driver.displayValue` but the type has `raw` and `baselineDiff` -- will align these during integration
- React 19 references in the source will work fine with React 18 in this project

### Steps

1. Install `recharts` dependency
2. Create all type, utility, and lib files with corrected imports
3. Create all component files with corrected imports
4. Update `Index.tsx` with the main app shell (view switcher, splash screen)
5. Update global CSS for dark theme support

