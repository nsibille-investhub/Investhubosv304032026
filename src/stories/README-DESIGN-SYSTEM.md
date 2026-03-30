# Design System Storybook Map (v3)

## Coverage
- Foundations: Colors, Typography
- Inputs: Button, Input, Select, Checkbox & Switch
- Data Display: Badge, Card, Avatar, Table
- Feedback: Alert, Skeleton
- Navigation: Tabs, Breadcrumb

## Refactoring suggestions
1. **Button variants**: keep `primary|secondary|ghost|danger|link` and deprecate aliases (`default|outline|destructive`) progressively.
2. **Tables**: standardize around `ui/table.tsx` and keep business wrappers thin.
3. **Status colors**: unify warning/error tokens from one source of truth.
4. **Micro-interactions**: enforce loading/disabled state for all submit actions.

## Missing core components (recommended)
- Empty state primitive
- Inline form validation helpers
- Toast story with async action examples
- Data grid with sortable headers primitive
