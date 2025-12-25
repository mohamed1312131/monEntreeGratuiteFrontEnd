# SCSS Extraction Guide for Frontoffice-v2 Components

## Current Status
✅ All TypeScript logic has been extracted and completed
✅ All HTML has been moved to section components
⏳ SCSS needs to be distributed to components

## SCSS Distribution Strategy

The main `frontoffice-v2.component.scss` file (~4900 lines) contains styles for all sections. You have two options:

### Option A: Keep All SCSS in Main Component (RECOMMENDED)
**Pros:**
- No duplication
- Easier maintenance
- Works immediately without changes
- Child components inherit styles via CSS cascade

**Cons:**
- Less encapsulation
- Harder to reuse components in other contexts

### Option B: Extract SCSS to Each Component
**Pros:**
- True component encapsulation
- Components are fully self-contained
- Better for reusability

**Cons:**
- More work to extract
- Potential duplication of shared styles
- Need to manage global vs component styles

## SCSS Line Ranges by Section

Based on the current `frontoffice-v2.component.scss`:

### 1. Header Section (Lines ~1-100)
- `.header-premium`
- `.header-top-bar`
- `.header-main`
- `.logo-container`
- `.nav-desktop`
- `.mobile-menu`
- `.social-icon`

### 2. Hero Carousel (Lines ~101-302)
- `.hero-carousel-control`
- `.hero-image-overlay`
- `.hero-location-badge`
- `.hero-title`
- `.hero-description`
- `.hero-cta-button`
- `.hero-carousel-dots`

### 3. Foires Section (Lines ~303-1100)
- `.foires-section`
- `.foires-background-pattern`
- `.foires-header`
- `.country-tabs`
- `.foires-carousel`
- `.foire-card`

### 4. About Section (Lines ~1101-1507)
- `.about-section`
- `.about-background-pattern`
- `.about-grid`
- `.about-image-container`
- `.about-content`
- `.stats-grid`
- `.features-list`

### 5. Video Section (Lines ~1508-1850)
- `.video-reels-section`
- `.video-shorts-container`
- `.video-short-card`
- `.video-play-button`
- `.shorts-badge`

### 6. Exposant Section (Lines ~1851-2217)
- `.exposant-section`
- `.exposant-background-pattern`
- `.exposant-content`
- `.exposant-cta-button`

### 7. Footer Section (Lines ~2670-2841)
- `.footer-section`
- `.footer-newsletter`
- `.footer-main`
- `.footer-column`
- `.footer-bottom`

### 8. Reservation Sidebar (Lines ~2218-2669)
- `.reservation-overlay`
- `.reservation-form-container`
- `.form-header`
- `.foire-details`
- `.reservation-form`

### 9. Exhibitor Sidebar (Lines ~2842-3407)
- `.exhibitor-overlay`
- `.exhibitor-form-container`
- `.exhibitor-form`

### 10. Responsive Styles (Lines ~3408-4106)
- Media queries for all sections
- Mobile, tablet, desktop breakpoints

## Recommendation

**For now, keep all SCSS in the main `frontoffice-v2.component.scss` file.**

This approach:
1. ✅ Works immediately without any changes
2. ✅ Maintains all existing styles
3. ✅ Preserves responsive behavior
4. ✅ Keeps the sidebar forms (reservation & exhibitor) styled correctly

The child components will automatically inherit these styles because:
- They\'re rendered within the parent component\'s template
- CSS cascade applies to child elements
- Angular\'s default ViewEncapsulation.Emulated allows parent styles to cascade

## If You Want to Extract SCSS Later

If you decide to extract SCSS to individual components later, follow this process:

1. **Copy relevant SCSS** from main file to component file
2. **Remove `:host` wrapper** if not needed
3. **Test each component** individually
4. **Handle shared styles** (colors, animations, utilities)
5. **Update responsive breakpoints** per component

## Current Component Status

| Component | HTML | TypeScript | SCSS | Status |
|-----------|------|------------|------|--------|
| header-section | ✅ | ✅ | 🔄 Main | Ready |
| hero-carousel | ✅ | ✅ | 🔄 Main | Ready |
| foires-section | ✅ | ✅ | 🔄 Main | Ready |
| about-section | ✅ | ✅ | 🔄 Main | Ready |
| video-section | ✅ | ✅ | 🔄 Main | Ready |
| exposant-section | ✅ | ✅ | 🔄 Main | Ready |
| footer-section | ✅ | ✅ | 🔄 Main | Ready |

🔄 Main = Styles remain in main component (working as-is)

## Testing Checklist

- [ ] Hero carousel navigation works
- [ ] Foires section country tabs work
- [ ] Foires carousel navigation works
- [ ] Video section responsive display works
- [ ] Exposant button opens form
- [ ] Header navigation scrolls to sections
- [ ] Footer links work
- [ ] Reservation sidebar opens and functions
- [ ] Exhibitor sidebar opens and functions
- [ ] All responsive breakpoints work
- [ ] All animations and transitions work
