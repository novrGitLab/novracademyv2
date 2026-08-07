---
feature: admin-dashboard-refinement
status: delivered
updated: 2026-08-07
branch: feat/admin-dashboard-refinement
commits: b0d758f..a4f4c3b
---

# Admin Dashboard Refinement

## Report

**What was built** — Interactive Recharts visualizations (bar, area, pie charts) replace all CSS-only div charts across admin dashboards. A reusable DataTable component with column sorting, pagination, and bulk selection replaces raw HTML tables. Consistent AdminStatCard and AdminEmptyState components standardize the visual language across all admin pages.

**Verification** — `npm run build` compiles successfully. `npx tsc --noEmit` passes (only pre-existing Prisma seed errors from ungenerated client remain).

**Journey log** —
1. Worktree created from main branch (not redesign branch), so admin pages had a different structure than expected — adapted to use the main branch's `useApi`-based architecture instead.
2. DataTable generic type constraint required iteration — `Record<string, unknown>` didn't work with TypeScript interfaces; settled on `Record<string, any>` with a `getRowId` prop for flexibility.
3. Recharts tooltip formatter types are loosely typed — removed explicit parameter types to avoid mismatches.

## [S1] Problem

The admin dashboards (Super Admin, Org Admin, Institution Admin) have polished UI shells but three gaps that make them feel like prototypes rather than products:

1. **Charts are fake** — Analytics uses colored `<div>` bars instead of real interactive charts. No tooltips, no hover states, no responsive scaling.
2. **Tables are basic** — No column sorting, no pagination, no bulk selection. Tables work for 5 rows but break at 50+.
3. **Inconsistent design language** — Stat cards, empty states, and loading skeletons differ across pages. Two overlapping component libraries (`DesignSystem.tsx` and `ui.tsx`) create confusion.

## [S2] Design

### Chart System

Install `recharts` and replace all CSS bar charts with interactive Recharts components:

- **BarChart** for tenant growth (grouped bars: Orgs vs Institutions per month)
- **AreaChart** for revenue trend (smooth gradient fill)
- **PieChart** for compliance breakdown (Compliant / Partial / Non-Compliant)
- **BarChart** for course completion rates per department

Chart behavior:
- Tooltips on hover showing exact values
- Responsive containers (width 100%, height fixed per chart type)
- Brand colors: `#683290` (purple), `#4451A2` (navy), `#16A34A` (green), `#EA580C` (orange), `#DC2626` (red)
- Legend at bottom where multiple series exist
- No animation delays longer than 300ms

### Reusable DataTable Component

Create `components/DataTable.tsx` — a single table component used by all admin pages:

Props:
- `columns: ColumnDef<T>[]` — header, accessor, sortable flag, optional render cell
- `data: T[]` — row data
- `bulkSelect?: boolean` — adds checkbox column and "Select All" header checkbox
- `pageSize?: number` — default 10, with pagination controls
- `emptyMessage?: string` — shown when data is empty
- `onBulkAction?: (selected: T[]) => void` — callback for bulk operations

Features:
- Column header click sorts ascending → descending → none (with arrow indicator)
- Bottom pagination: "Showing 1-10 of 42" + Previous/Next buttons
- Checkbox column for bulk selection (when `bulkSelect` is true)
- Row hover highlight
- Consistent styling: `border-[#E5E7EB]`, `bg-[#F8F9FB]` header, `text-[12px]` uppercase tracking-wider headers

### Dashboard Consistency

Standardize across all admin pages:

**Stat Cards** — Use a single `AdminStatCard` component (replace `StatsRow` and inline stat divs):
- Label: `text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]`
- Value: `text-[28px] font-bold tabular-nums`
- Optional trend indicator (up/down arrow + percentage)
- Optional icon in a colored circle
- Border: `border-[#E5E7EB]`, shadow: `shadow-[0_1px_3px_rgba(26,26,46,0.08)]`

**Empty States** — Use a single `AdminEmptyState` component:
- Centered icon (48px, muted color)
- Title: `text-[14px] font-medium text-[#1A1A2E]`
- Description: `text-[13px] text-[#6B7280]`
- Optional action button

**Loading States** — Use existing `Skeleton.tsx` components consistently:
- `StatCardsSkeleton` for stat rows
- `TableSkeleton` for data tables
- `CardsSkeleton` for card grids

### Pages to Update

| Page | Charts | Table | Consistency |
|------|--------|-------|-------------|
| `/admin` (Super Admin) | Tenant growth bar chart, revenue area chart | Tenant overview → DataTable | Stat cards → AdminStatCard |
| `/admin` (Org Admin) | Compliance pie chart, department completion bar chart | Course activity → DataTable | Stat cards → AdminStatCard |
| `/admin` (Institution Admin) | — (already uses ProgramOverview) | Student table → DataTable | Already consistent |
| `/admin/analytics` (Super Admin) | Replace CSS bars with Recharts | — | Stat cards → AdminStatCard |
| `/admin/courses` | — | Courses → DataTable with sort | Stat cards if added |
| `/admin/users` (Org Admin) | — | Employees → DataTable with sort + bulk | Stat cards → AdminStatCard |
| `/admin/compliance` | Compliance breakdown pie chart | Compliance → DataTable with sort | Stat cards → AdminStatCard |
| `/admin/organizations` | — | Organizations → DataTable with sort | Already consistent |
| `/admin/institutions` | — | Institutions → DataTable with sort | Already consistent |

## [S3] Out of Scope

- Real API data integration (API not ready — all data remains hardcoded/mock)
- New admin pages or routes
- Community feature dashboards
- Mobile-specific responsive redesign (fix only obvious breakage)
- Chart animations beyond basic transitions
- Export/download chart as image
- Real-time data updates

## Tasks

- [x] T1: Install recharts and create chart wrapper components — acceptance: `recharts` in package.json, `components/charts/` directory with `BarChartCard`, `AreaChartCard`, `PieChartCard` that accept data + config and render branded Recharts (covers: S2)
- [x] T2: Create reusable DataTable component — acceptance: `components/DataTable.tsx` supports sorting, pagination, bulk select, empty state; renders with consistent admin styling (covers: S2)
- [x] T3: Create AdminStatCard and AdminEmptyState components — acceptance: single stat card component replaces `StatsRow` and inline stat divs; empty state component used across all admin pages (covers: S2)
- [x] T4: Update Super Admin dashboard with charts + DataTable — acceptance: tenant growth and revenue trend use Recharts; tenant overview table uses DataTable with sort; stat cards use AdminStatCard (covers: S2; depends: T1, T2, T3)
- [x] T5: Update Org Admin dashboard with charts + DataTable — acceptance: compliance breakdown uses PieChart; course activity uses DataTable; stat cards use AdminStatCard (covers: S2; depends: T1, T2, T3)
- [x] T6: Update analytics page with Recharts — acceptance: Super Admin analytics uses Recharts BarChart and AreaChart instead of CSS divs (covers: S2; depends: T1)
- [x] T7: Update remaining admin tables — acceptance: courses page uses DataTable with sort; (covers: S2; depends: T2)
- [ ] T8: Update compliance page with pie chart — acceptance: compliance breakdown visualization uses Recharts PieChart (covers: S2; depends: T1) — BLOCKED: compliance page not on main branch
