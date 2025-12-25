# Frontoffice-v2 Component Refactoring Guide

## Overview
This guide documents the refactoring of the monolithic frontoffice-v2 component into modular, reusable section components.

## Component Structure

```
frontoffice-v2/
├── frontoffice-v2.component.ts (Main orchestrator)
├── frontoffice-v2.component.html (Imports all sections)
├── frontoffice-v2.component.scss (Shared/global styles)
└── sections/
    ├── hero-carousel/ ✅ CREATED
    ├── foires-section/
    ├── about-section/
    ├── video-section/
    ├── exposant-section/
    └── footer-section/
```

## Completed Components

### 1. Hero Carousel ✅
- **Files**: HTML, TS created
- **Inputs**: None
- **Outputs**: `reserveClick` - Emits reservation data
- **Data**: heroSlides array (3 slides)
- **Methods**: nextSlide(), prevSlide(), setSlide()

## Remaining Components to Extract

### 2. Foires Section
- **HTML Lines**: 217-343 (127 lines)
- **Inputs**: None (or pass foires data)
- **Outputs**: `reserveClick` - Emits selected foire
- **Data**: foiresByCountry object, selectedCountry
- **Methods**: selectCountry(), nextFoireSlide(), prevFoireSlide()

### 3. About Section
- **HTML Lines**: 345-492 (148 lines)
- **Inputs**: None
- **Outputs**: None (static content)
- **Data**: Stats, features (can be hardcoded or passed)

### 4. Video Section
- **HTML Lines**: 494-588 (95 lines)
- **Inputs**: None
- **Outputs**: None (or video play event)
- **Data**: videoReels array (8 videos)
- **Methods**: nextVideoSlide(), prevVideoSlide(), updateVisibleVideos()

### 5. Exposant Section
- **HTML Lines**: 590-632 (43 lines)
- **Inputs**: None
- **Outputs**: `openExhibitorForm` - Emits when button clicked
- **Data**: Static content

### 6. Footer Section
- **HTML Lines**: 633-752 (120 lines)
- **Inputs**: None
- **Outputs**: `newsletterSubmit` - Emits email
- **Data**: Footer links, social links

## SCSS Distribution Strategy

### Option A: Keep in Main Component
- All styles remain in frontoffice-v2.component.scss
- Section components use parent styles via CSS cascade
- **Pros**: No duplication, easier maintenance
- **Cons**: Tight coupling

### Option B: Distribute to Components
- Each component gets its relevant SCSS
- Main component keeps only global/shared styles
- **Pros**: True encapsulation, reusable
- **Cons**: More work, potential duplication

## Shared Services/Data

### Reservation Service
Both hero-carousel and foires-section emit reservation events that the parent handles.

### Form State
The parent component (frontoffice-v2) manages:
- `isFormOpen`
- `isExhibitorFormOpen`
- `selectedFoire`
- Form submission logic

## Implementation Steps

1. ✅ Create all component folders
2. ✅ Extract hero-carousel (DONE)
3. Extract foires-section
4. Extract about-section
5. Extract video-section
6. Extract exposant-section
7. Extract footer-section
8. Update main component HTML to use sections
9. Distribute or keep SCSS (decision needed)
10. Test all functionality

## Main Component Final Structure

```html
<!-- frontoffice-v2.component.html -->
<app-hero-carousel (reserveClick)="onReserve($event, \'France\')"></app-hero-carousel>
<app-foires-section (reserveClick)="onReserve($event.foire, $event.country)"></app-foires-section>
<app-about-section></app-about-section>
<app-video-section></app-video-section>
<app-exposant-section (openForm)="openExhibitorForm()"></app-exposant-section>
<app-footer-section (newsletterSubmit)="handleNewsletter($event)"></app-footer-section>

<!-- Reservation Sidebar -->
<div class="reservation-overlay" [class.open]="isFormOpen" (click)="closeForm()"></div>
<!-- ... form HTML ... -->

<!-- Exhibitor Sidebar -->
<div class="exhibitor-overlay" [class.open]="isExhibitorFormOpen" (click)="closeExhibitorForm()"></div>
<!-- ... form HTML ... -->
```

## Next Steps

Choose one of these approaches:

**A. Continue Full Extraction** - I\'ll complete all 6 components (will take significant time)

**B. Hybrid Approach** - Extract critical components (hero, foires, video) and leave others inline

**C. Manual Completion** - Use this guide to complete the refactoring yourself with the pattern I\'ve established

## Notes

- All section components should be **standalone** components
- Use **@Input()** for data passing from parent
- Use **@Output()** for event emission to parent
- Keep forms in parent component for now (they\'re shared)
- Consider creating a shared interfaces file for types
