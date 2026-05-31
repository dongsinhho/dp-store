# Implementation Plan: Modern Website Redesign

## Overview

Redesign giao diện website Đình Phong Store theo hướng hiện đại với design system mới, glassmorphism header, animated hero section, enhanced product cards, scroll-triggered animations, page transitions, responsive improvements, và accessibility enhancements. Toàn bộ chức năng hiện tại được giữ nguyên. Implementation sử dụng TypeScript, Next.js 14, Tailwind CSS, và CSS custom properties.

## Tasks

- [x] 1. Set up Design System foundation
  - [x] 1.1 Define CSS custom properties and update globals.css
    - Add all design tokens (colors, typography, spacing, border-radius, shadows) as CSS custom properties in `:root`
    - Preserve existing dark mode overrides and extend with new token-based dark mode variables
    - Add `prefers-reduced-motion` media query to disable animations globally
    - Add keyframe definitions for `fade-in-up` and `fade-in` animations
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 11.4_

  - [x] 1.2 Extend Tailwind config with design tokens
    - Add color tokens (primary, secondary, accent, neutral scale) referencing CSS custom properties
    - Add border-radius tokens (sm, md, lg, full)
    - Add box-shadow tokens (subtle, medium, elevated)
    - Add keyframes and animation utilities (fade-in-up, fade-in)
    - Preserve existing screens config (mobile, tablet, desktop)
    - _Requirements: 1.1, 1.3, 1.4, 1.5_

  - [x] 1.3 Write property test for spacing scale (Property 1)
    - **Property 1: Spacing scale values are multiples of 4px base unit**
    - **Validates: Requirements 1.3**

  - [x] 1.4 Write property test for color contrast WCAG AA (Property 2)
    - **Property 2: Color contrast meets WCAG AA**
    - **Validates: Requirements 1.6, 14.5**

- [x] 2. Implement useScrollAnimation hook and AnimatedSection component
  - [x] 2.1 Create useScrollAnimation custom hook
    - Implement IntersectionObserver-based hook in `src/hooks/useScrollAnimation.ts`
    - Support configurable threshold, rootMargin, and triggerOnce options
    - Respect `prefers-reduced-motion` by returning `isVisible: true` immediately
    - Handle IntersectionObserver unavailability gracefully (fallback to visible)
    - _Requirements: 11.1, 11.4_

  - [x] 2.2 Create AnimatedSection wrapper component
    - Implement `src/components/AnimatedSection.tsx` using useScrollAnimation hook
    - Support className and delay props for staggered animations
    - Apply fade-in-up animation class when isVisible is true
    - _Requirements: 11.1, 11.2_

- [x] 3. Implement PageTransition component
  - [x] 3.1 Create PageTransition layout wrapper
    - Implement `src/components/PageTransition.tsx` with CSS fade-in animation on mount
    - Duration 300ms, ease-out timing
    - Respect `prefers-reduced-motion` (skip animation)
    - _Requirements: 11.3, 11.4_

  - [x] 3.2 Integrate PageTransition into app layout
    - Wrap `{children}` in `src/app/layout.tsx` with PageTransition component
    - Ensure no layout shift from transition wrapper
    - _Requirements: 11.3_

- [x] 4. Checkpoint - Verify foundation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Redesign Header with glassmorphism
  - [x] 5.1 Implement glassmorphism Header component
    - Rewrite `src/components/Header.tsx` with scroll-based glassmorphism effect
    - Add `backdrop-blur-lg bg-white/80` when scrolled > 0px, solid white at top
    - Keep fixed positioning with appropriate z-index
    - Preserve all navigation links (Sản phẩm, Sửa chữa, Thu cũ đổi mới) and cart link (/gio-hang)
    - Add hover underline animation on nav links (300ms)
    - Display cart badge: hidden at 0, numeric 1-99, "99+" for >99
    - Add ARIA labels: `aria-expanded` on menu toggle, `aria-label` on cart with count
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.7, 2.8, 2.9_

  - [x] 5.2 Implement mobile slide-in menu
    - Add hamburger button visible below 768px viewport
    - Slide-in panel from right with 300ms transition
    - Close on outside tap, close button, or link navigation
    - Overlay backdrop when menu is open
    - Focus trap and Escape key support for accessibility
    - _Requirements: 2.5, 2.6, 2.9, 14.7_

  - [x] 5.3 Write property test for cart badge display logic (Property 3)
    - **Property 3: Cart badge display logic**
    - **Validates: Requirements 2.4**

- [x] 6. Redesign HeroSection with animations
  - [x] 6.1 Implement animated HeroSection component
    - Rewrite `src/components/HeroSection.tsx` (or create if not exists)
    - Full-width gradient background with decorative blur circles
    - Headline with fade-in-up animation (800ms, ease-out) on mount
    - CTA button "Xem sản phẩm" linking to product listing, hover scale 1.05 with gradient shift
    - Contact info in pill/badge containers (address, hotline)
    - Responsive text: mobile 1.875rem, tablet 2.25rem, desktop 3rem
    - Communicate store's core offering (iPhone sales, chính hãng, giá tốt)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 7. Redesign ProductCard with enhanced interactions
  - [x] 7.1 Implement enhanced ProductCard component
    - Rewrite `src/components/ProductCard.tsx` with new design
    - Square aspect-ratio image container, border-radius 8px, hover scale 105% (300ms)
    - Discount badge top-left with calculated percentage
    - Product name max 2 lines (line-clamp-2), price bold, original price strikethrough
    - Storage/color attribute tags, battery health for "used" condition
    - Shadow: rest = subtle, hover = elevated (200ms transition)
    - Stock warning: orange for 1-3, red "Hết hàng" for 0
    - Hover overlay with "Xem chi tiết" button (200ms fade-in)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 7.2 Write property test for discount percentage calculation (Property 4)
    - **Property 4: Discount percentage calculation**
    - **Validates: Requirements 4.2**

  - [x] 7.3 Write property test for product card conditional rendering (Property 5)
    - **Property 5: Product card conditional rendering**
    - **Validates: Requirements 4.3, 4.5**

  - [x] 7.4 Write property test for image alt text validity (Property 6)
    - **Property 6: Image alt text validity**
    - **Validates: Requirements 14.4**

- [x] 8. Redesign ProductGrid with staggered animations
  - [x] 8.1 Implement enhanced ProductGrid component
    - Update `src/components/ProductGrid.tsx` with responsive grid (1 col mobile, 2 col tablet, 3-4 col desktop)
    - Gap: 16px mobile, 24px tablet/desktop
    - Integrate AnimatedSection for staggered fade-in (50-100ms delay between items, 300ms per item)
    - Empty state message when no products match filters
    - _Requirements: 5.1, 5.2, 5.6_

  - [x] 8.2 Style filter controls and pagination
    - Update `src/components/ProductFilters.tsx` with dropdown menus and dismissible chip elements
    - Update `src/components/Pagination.tsx` with rounded buttons, filled active page
    - Preserve all existing filter functionality (category, condition, price range, search, sort)
    - _Requirements: 5.3, 5.4, 5.5_

- [x] 9. Checkpoint - Verify core components
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Redesign Cart page
  - [x] 10.1 Restyle cart page with modern design
    - Update `src/app/gio-hang/page.tsx` with card-based cart items
    - Each item: product image (min 80x80px), name, unit price, quantity controls, subtotal, remove button
    - Rounded quantity buttons (border-radius 50%), CSS transition ≤300ms
    - Sticky cart summary on desktop (≥1024px) with total count and amount (≥1.25rem)
    - Gradient checkout button with hover state change
    - Empty state with icon (min 64x64px) and CTA link to /san-pham
    - Preserve all cart operations (add, remove, update quantity min 1/max stock, checkout)
    - Disable decrease button when quantity is 1
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 11. Redesign Checkout page
  - [x] 11.1 Restyle checkout form and order summary
    - Update `src/app/dat-hang/page.tsx` with top-aligned labels, focus rings, rounded borders (≥8px)
    - Validation error messages with slide-down animation (150-300ms), red accent
    - Desktop (≥768px): order summary as sidebar
    - Mobile (<768px): order summary as collapsible section (expanded by default)
    - Success confirmation with animated checkmark (300-600ms), order ID, total
    - Preserve existing functionality: Zod validation, server action, stock conflict UI, empty-cart guard, duplicate-submission prevention
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 12. Redesign Repair page
  - [x] 12.1 Restyle repair services and form
    - Update `src/app/sua-chua/page.tsx` with card grid (1 col mobile, 2 col tablet, 3 col desktop)
    - Each service card: icon, title, description, hover translate-up 2-4px (150-300ms)
    - Form inputs with visible borders, consistent border-radius, focus ring
    - File upload area with dashed border, color change on drag-over
    - Success confirmation with entrance animation (300-1000ms)
    - Preserve all repair form functionality: validation, file upload (JPG/PNG, 5MB, max 5 files), submission, disabled state
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 13. Redesign Trade-in page
  - [x] 13.1 Restyle trade-in process and form
    - Update `src/app/thu-cu-doi-moi/page.tsx` with 3-step visual guide (horizontal desktop, vertical mobile)
    - Form inputs with rounded borders, gray background (bg-gray-50), focus ring, inline validation
    - Product selector dropdown with type-to-filter, showing name and VND price
    - File upload area matching repair page styling (dashed border, click + drag-and-drop)
    - Error message on server failure with retry (preserve form data)
    - Success confirmation with icon and "submit another" button
    - Preserve all trade-in functionality: Zod validation, file upload, product selection, submission
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [x] 14. Checkpoint - Verify page redesigns
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Redesign Footer
  - [x] 15.1 Implement modern multi-column Footer
    - Rewrite `src/components/Footer.tsx` with 3-column layout (brand/tagline, navigation, contact)
    - Dark gradient background (luminance ≤30%), text contrast ≥4.5:1
    - Social icons with hover color change (200ms)
    - Contact items with icons (MapPin, Phone, Facebook) from lucide-react
    - Preserve all content: store name, address (150 Thái Thị Bôi), phones, Facebook, copyright, nav links
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 16. Implement Skeleton loading components
  - [x] 16.1 Create skeleton loading placeholders
    - Create `src/components/skeletons/ProductCardSkeleton.tsx`
    - Create `src/components/skeletons/ProductGridSkeleton.tsx` with count prop
    - Create `src/components/skeletons/HeroSkeleton.tsx`
    - Match dimensions of actual components to prevent layout shift
    - Pulse animation for loading state
    - _Requirements: 14.6_

  - [x] 16.2 Integrate skeletons with Suspense boundaries
    - Add Suspense boundaries in homepage, product listing, and other data-fetching pages
    - Use skeleton components as fallback
    - Ensure skeletons display when content takes >2 seconds to load
    - _Requirements: 14.6_

- [x] 17. Apply design tokens to Admin Panel (minimal changes)
  - [x] 17.1 Update Admin Panel with design tokens only
    - Apply color, typography, and spacing tokens from Design_System to admin pages
    - Do NOT change layout, navigation paths, form field order, or workflows
    - Preserve all CRUD operations: products, orders, repair requests, trade-in requests
    - Preserve authentication requirement for all admin operations
    - Verify admin sidebar, forms, and tables still function correctly
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [x] 18. Responsive design and accessibility improvements
  - [x] 18.1 Implement responsive design enhancements
    - Ensure touch targets ≥44x44px with ≥8px spacing on mobile (<640px)
    - Apply fluid typography: 14px mobile, 15px tablet, 16px desktop base
    - Container padding: 16px mobile, 24px tablet, 32px desktop
    - Verify no horizontal scroll at any viewport 320px–1920px
    - Collapsed nav on mobile, single-column product grid on mobile
    - Images scale within container (max-width: 100%, maintain aspect ratio)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

  - [x] 18.2 Implement accessibility improvements
    - Add semantic HTML elements and ARIA attributes (WAI-ARIA 1.2)
    - Ensure all images have non-empty alt text (1-150 characters)
    - Add visible focus indicators (≥2px outline) on all interactive elements
    - Ensure logical tab order matching visual reading sequence
    - Verify keyboard operability for all interactive components
    - _Requirements: 14.2, 14.3, 14.4, 14.5, 14.7_

- [x] 19. Performance optimization
  - [x] 19.1 Optimize animations and images for performance
    - Verify all animations use only composite-friendly properties (transform, opacity)
    - Ensure CLS < 0.1 with animations enabled
    - Use Next.js Image component with proper sizing for all product images
    - Verify LCP not delayed >100ms by animations vs disabled state
    - Target Lighthouse Performance ≥80 (mobile), Accessibility ≥90
    - _Requirements: 14.1, 14.2, 11.5_

- [x] 20. Final checkpoint - Full verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Admin panel receives only design token updates — no layout or workflow changes
- All animations respect `prefers-reduced-motion: reduce` preference
- Existing functionality (cart, checkout, repair, trade-in, admin CRUD) must remain fully operational

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "1.4", "2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "3.2", "5.1"] },
    { "id": 3, "tasks": ["5.2", "5.3", "6.1"] },
    { "id": 4, "tasks": ["7.1", "15.1"] },
    { "id": 5, "tasks": ["7.2", "7.3", "7.4", "8.1"] },
    { "id": 6, "tasks": ["8.2", "10.1", "11.1"] },
    { "id": 7, "tasks": ["12.1", "13.1"] },
    { "id": 8, "tasks": ["16.1", "17.1"] },
    { "id": 9, "tasks": ["16.2", "18.1"] },
    { "id": 10, "tasks": ["18.2", "19.1"] }
  ]
}
```
