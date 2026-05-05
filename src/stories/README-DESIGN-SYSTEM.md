# Design System Storybook Map (strict mapping)

Source of truth: `src/components/ui/*`.

## Stories mapped to existing components only
- Foundations
  - `Separator` (`Foundations/Colors.stories.tsx`)
  - `Label` (`Foundations/Typography.stories.tsx`)
- Inputs
  - `Button`, `Input`, `SearchInput`, `Select`, `SegmentedControl`, `Checkbox`, `Switch`, `DocumentAddModal` (Folder Selector GED)
- Data Display
  - `Badge`, `Card`, `Avatar`, `Table`, `InvestorDataTable` (name field exact usage), `OneToManyPersonsCell` (contacts one-to-many), `KpiCard`, `FilterCard`, `PartyTypeBadge`
- Feedback
  - `Alert`, `Skeleton`
- Navigation
  - `Tabs`, `Breadcrumb`, `PageHeader`

No generated components, no renamed components, no merged components.
