# Implementation Plan: iPhone Store Website

## Overview

Implement an iPhone e-commerce website with 3 main services (Buy/Sell, Repair, Trade-in) using Pocketbase as the backend all-in-one solution and NextJS 14+ App Router for the frontend. The implementation follows an incremental approach: project setup → data layer → core features → admin dashboard → testing → integration.

## Tasks

- [x] 1. Set up project structure and core configuration
  - [x] 1.1 Initialize NextJS 14+ project with App Router and configure dependencies
    - Create NextJS project with TypeScript, Tailwind CSS, and App Router
    - Install dependencies: `pocketbase`, `zod`, `lucide-react`
    - Configure `tailwind.config.ts`, `tsconfig.json`, and environment variables (`NEXT_PUBLIC_POCKETBASE_URL`, `POCKETBASE_URL`)
    - Create `.env.local` with Pocketbase URL defaults
    - _Requirements: 13.1, 13.2_

  - [x] 1.2 Set up Pocketbase client library and server/client utilities
    - Create `lib/pocketbase.ts` with client-side PocketBase instance and `createServerPb()` for server components
    - Create `lib/types.ts` with all TypeScript interfaces (Product, Category, Order, OrderItem, RepairRequest, TradeInRequest, Cart, CartItem)
    - Create `lib/constants.ts` with status enums (OrderStatus, RepairStatus, TradeInStatus) and valid transitions map
    - _Requirements: 4.1, 6.1, 8.1_

  - [x] 1.3 Set up testing framework
    - Install and configure Vitest with `vitest.config.ts`
    - Install `@testing-library/react`, `fast-check`, and `jsdom`
    - Create test setup file with localStorage mock
    - _Requirements: (testing infrastructure)_

- [x] 2. Implement data validation and business logic layer
  - [x] 2.1 Implement Zod validation schemas for all forms
    - Create `lib/validations.ts` with schemas for: order form (customer_name, customer_phone Vietnamese format, customer_address, payment_method), repair form (customer_name, customer_phone, device_model, issue_description min 10 chars), trade-in form (customer_name, customer_phone, old_device_model, old_device_storage, old_device_condition min 10 chars)
    - Implement Vietnamese phone number regex: `/^0[35789]\d{8}$/`
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4, 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 2.2 Implement product validation schema and slug generation
    - Create `lib/product-validation.ts` with Zod schema for Product (price > 0 and <= 999999999, stock >= 0 and <= 9999, battery_health 0-100 for used, name max 200 chars, at least 1 image max 10)
    - Implement `generateSlug()` function: lowercase, remove Vietnamese diacritics, replace spaces/special chars with hyphens
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [x] 2.3 Implement status transition validation logic
    - Create `lib/status-transitions.ts` with functions: `validateOrderTransition()`, `validateRepairTransition()`, `validateTradeInTransition()`
    - Define valid transition maps for each status type
    - Return error messages for invalid transitions
    - _Requirements: 4.1, 4.2, 4.3, 4.7, 6.1, 6.2, 6.3, 8.1, 8.2, 8.3_

  - [x] 2.4 Write property tests for status transitions
    - **Property 8: Valid order status transitions**
    - **Property 9: Valid repair status transitions**
    - **Property 10: Valid trade-in status transitions**
    - **Validates: Requirements 4.1, 4.2, 4.3, 6.1, 6.2, 6.3, 8.1, 8.2, 8.3**

  - [x] 2.5 Write property test for slug generation
    - **Property 13: Slug uniqueness and generation**
    - **Validates: Requirements 9.4, 9.5**

  - [x] 2.6 Write property test for form validation
    - **Property 12: Form validation rejects invalid inputs**
    - **Validates: Requirements 3.2, 3.3, 3.4, 5.1, 5.2, 5.3, 5.4, 7.1, 7.2, 7.3, 7.4**

  - [x] 2.7 Write property test for file upload validation
    - **Property 14: File upload validation**
    - **Validates: Requirements 11.1, 11.2**

- [x] 3. Implement cart management
  - [x] 3.1 Implement cart logic functions
    - Create `lib/cart.ts` with pure functions: `addToCart()`, `removeFromCart()`, `updateCartQuantity()`, `clearCart()`
    - Implement precondition checks (product active, sufficient stock, quantity > 0)
    - Ensure totalAmount and totalItems are recalculated on every operation
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.11, 2.12_

  - [x] 3.2 Implement useCart hook with localStorage persistence
    - Create `hooks/useCart.ts` client-side hook
    - Load cart from localStorage on mount, save on every change
    - Handle invalid/missing localStorage data gracefully (initialize empty cart)
    - Expose: `cart`, `add`, `remove`, `updateQuantity`, `clear`
    - _Requirements: 2.9, 2.10_

  - [x] 3.3 Write property tests for cart operations
    - **Property 1: Cart total consistency**
    - **Property 2: Add to cart guarantees presence**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8**

  - [x] 3.4 Write property test for cart localStorage round-trip
    - **Property 3: Cart localStorage round-trip**
    - **Validates: Requirements 2.9**

- [x] 4. Checkpoint - Core logic verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement product browsing pages
  - [x] 5.1 Implement product data fetching with filters
    - Create `lib/products.ts` with `getProducts()` function supporting pagination (12/page), category filter, condition filter, price range, search query, and sort
    - Ensure only `is_active = true` products are returned
    - Implement `getProductBySlug()` for detail page
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.11_

  - [x] 5.2 Write property tests for product fetching
    - **Property 6: Active-only product visibility**
    - **Property 7: Filter correctness**
    - **Validates: Requirements 1.2, 1.3, 1.4, 1.5, 1.6**

  - [x] 5.3 Create product listing page with SSR
    - Create `app/san-pham/page.tsx` as a server component
    - Implement ProductGrid component with responsive grid layout (mobile 1-2 cols, desktop 3-4 cols)
    - Add pagination controls
    - Implement ISR with `revalidate: 60`
    - _Requirements: 1.1, 1.8, 13.1, 13.2_

  - [x] 5.4 Create product filter and search components
    - Create `components/ProductFilters.tsx` with category dropdown, condition toggle, price range inputs, search input
    - Implement URL-based filter state using searchParams
    - Show empty state message when no products match
    - Show validation error for invalid price range (min > max)
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.9, 1.10, 1.11_

  - [x] 5.5 Create product detail page
    - Create `app/san-pham/[slug]/page.tsx` as a server component
    - Display: name, price, original_price (discount), condition, storage, color, battery_health (used only), description, image gallery
    - Add "Add to Cart" button with quantity selector
    - Generate meta title (max 60 chars) and meta description (max 160 chars) from product data
    - Add Open Graph tags and canonical URL
    - _Requirements: 1.7, 13.3, 13.4, 13.5_

- [x] 6. Implement order placement flow
  - [x] 6.1 Create cart page UI
    - Create `app/gio-hang/page.tsx` as a client component
    - Display cart items with quantity controls, remove button, item subtotals
    - Show cart total and "Proceed to Checkout" button
    - Handle empty cart state
    - _Requirements: 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x] 6.2 Create checkout page and order submission
    - Create `app/dat-hang/page.tsx` with order form (customer_name, customer_phone, customer_email, customer_address, payment_method, notes)
    - Implement client-side validation using Zod schemas
    - Implement `createOrder()` server action: validate stock, create order + order_items, decrement stock, clear cart
    - Disable submit button after first click to prevent duplicates
    - Show confirmation page on success
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13_

  - [x] 6.3 Write property tests for order operations
    - **Property 4: Order total matches items**
    - **Property 5: Stock non-negativity**
    - **Validates: Requirements 3.10, 4.5, 9.2**

- [x] 7. Implement repair request flow
  - [x] 7.1 Create repair request page
    - Create `app/sua-chua/page.tsx` with repair service info and request form
    - Implement form with fields: customer_name, customer_phone, device_model, issue_description (min 10 chars), images (up to 5, JPG/PNG, max 5MB each)
    - Implement client-side validation with Zod
    - Implement `submitRepairRequest()` server action with FormData for file upload
    - Disable submit button after first click
    - Show confirmation message on success
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 11.1, 11.2, 11.3, 11.4_

- [x] 8. Implement trade-in request flow
  - [x] 8.1 Create trade-in request page
    - Create `app/thu-cu-doi-moi/page.tsx` with trade-in service info and request form
    - Implement form with fields: customer_name, customer_phone, old_device_model, old_device_storage, old_device_condition (min 10 chars), old_device_battery, new_product selector (optional), old_device_images (up to 5)
    - Validate selected new_product exists and is_active
    - Implement `submitTradeInRequest()` server action
    - Show confirmation message on success
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 11.1, 11.2, 11.3, 11.4_

  - [x] 8.2 Write property test for trade-in price calculation
    - **Property 11: Trade-in price difference calculation**
    - **Validates: Requirements 8.4, 8.5**

- [x] 9. Checkpoint - Customer-facing features complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement admin dashboard
  - [x] 10.1 Create admin layout with authentication guard
    - Create `app/admin/layout.tsx` with auth check (redirect non-admin to login)
    - Create `app/admin/login/page.tsx` with email/password login form
    - Implement admin auth middleware using Pocketbase auth
    - _Requirements: 10.1, 10.2, 10.9_

  - [x] 10.2 Create admin product management page
    - Create `app/admin/san-pham/page.tsx` with product list table (name, price, stock, status)
    - Create `app/admin/san-pham/[id]/page.tsx` for create/edit product form
    - Implement product CRUD with validation (auto-generate slug, validate all fields)
    - Restrict create/update/delete to admin only
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 10.3, 10.4_

  - [x] 10.3 Create admin order management page
    - Create `app/admin/don-hang/page.tsx` with order list (customer, total, status, date)
    - Create `app/admin/don-hang/[id]/page.tsx` for order detail with status update controls
    - Implement status transition buttons with validation (only show valid next states)
    - Handle stock restoration on cancellation
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 10.6_

  - [x] 10.4 Create admin repair request management page
    - Create `app/admin/sua-chua/page.tsx` with repair request list
    - Create `app/admin/sua-chua/[id]/page.tsx` for detail with status update, diagnosis input, and cost estimation
    - Require estimated_cost when transitioning to "quoted"
    - Implement realtime status updates via Pocketbase subscriptions
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 10.7_

  - [x] 10.5 Create admin trade-in management page
    - Create `app/admin/thu-cu/page.tsx` with trade-in request list
    - Create `app/admin/thu-cu/[id]/page.tsx` for detail with evaluation form (trade_in_value input, auto-calculate price_difference)
    - Require trade_in_value when transitioning to "evaluated"
    - Implement realtime updates
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 10.7_

- [x] 11. Implement shared UI components and layout
  - [x] 11.1 Create site layout and navigation
    - Create `app/layout.tsx` with header (logo, nav links, cart icon with count), footer
    - Create responsive navigation: hamburger menu on mobile, horizontal nav on desktop
    - Implement cart icon badge showing totalItems from useCart hook
    - _Requirements: 13.1_

  - [x] 11.2 Create homepage
    - Create `app/page.tsx` with hero section, featured products, service cards (Buy/Sell, Repair, Trade-in)
    - Use server component with ISR for product data
    - _Requirements: 13.2_

- [x] 12. Implement error handling and resilience
  - [x] 12.1 Implement connection error handling and retry logic
    - Create `lib/error-handling.ts` with exponential backoff utility (start 1s, double each attempt, max 30s, max 10 attempts)
    - Create error boundary components for Pocketbase connection failures
    - Display maintenance message when connection lost, auto-remove when reconnected (within 3s)
    - Implement ISR fallback for cached content during outages
    - _Requirements: 12.1, 12.4, 12.5_

  - [x] 12.2 Implement stock conflict handling at checkout
    - Add stock re-verification in checkout flow before order creation
    - Display specific error message with product name and remaining stock
    - Allow user to update quantity or remove item without losing cart
    - _Requirements: 12.2_

  - [x] 12.3 Implement file upload error handling
    - Create reusable `ImageUpload` component with client-side validation (type: JPG/PNG, size: max 5MB)
    - Show specific error messages for invalid format or size
    - Retain form data on upload failure, allow retry
    - _Requirements: 11.5, 12.3_

- [x] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Set up PocketBase server-side
  - [ ] 14.1 Create PocketBase migration schema for all collections
    - Create `pocketbase/pb_migrations/` directory with migration files
    - Define `products` collection: all fields (name, slug, category relation, condition, price, original_price, storage, color, battery_health, description, images file[], stock, is_active), API rules (public read, admin write)
    - Define `categories` collection: name, slug, description, image, sort_order, is_active, API rules
    - Define `orders` collection: customer_name, customer_phone, customer_email, customer_address, total_amount, status, payment_method, notes, user relation (optional), API rules (public create, owner read, admin full)
    - Define `order_items` collection: order relation, product relation, quantity, price, API rules
    - Define `repair_requests` collection: all fields + images file[], status, estimated_cost, actual_cost, diagnosis, API rules (public create, owner read, admin full)
    - Define `trade_in_requests` collection: all fields + old_device_images file[], new_product relation, trade_in_value, price_difference, status, admin_notes, API rules (public create, owner read, admin full)
    - Configure users collection with role field (admin/user)
    - _Requirements: All data model requirements_

  - [ ] 14.2 Create PocketBase setup and run script
    - Create `pocketbase/setup.sh` (Linux/Mac) and `pocketbase/setup.ps1` (Windows) scripts
    - Script should: download PocketBase binary for the platform, create data directory, apply migrations, create default admin account
    - Create `pocketbase/README.md` with setup instructions
    - Create `package.json` script `"pb:setup"` and `"pb:start"` for convenience
    - Add `pocketbase/pb_data/` to `.gitignore`
    - _Requirements: Infrastructure setup_

  - [ ] 14.3 Create seed data script for development
    - Create `pocketbase/seed.ts` script that populates sample data via PocketBase API
    - Seed: 3-5 categories (iPhone 15 Series, iPhone 14 Series, iPhone 13 Series, Phụ kiện)
    - Seed: 10-15 sample products with realistic Vietnamese names, prices, descriptions
    - Seed: 1 admin user (admin@dpstore.vn / admin123)
    - Add `"pb:seed"` script to package.json
    - _Requirements: Development convenience_

- [ ] 15. Final verification with PocketBase
  - Run PocketBase server, seed data, verify frontend connects and displays products correctly.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The design uses TypeScript throughout; all implementations use TypeScript
- Pocketbase collections should be configured via the Pocketbase Admin UI or migration scripts before frontend development
- Vietnamese language is used for URL paths (e.g., `/san-pham`, `/sua-chua`) matching the target market

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1", "2.2", "2.3", "3.1"] },
    { "id": 3, "tasks": ["2.4", "2.5", "2.6", "2.7", "3.2"] },
    { "id": 4, "tasks": ["3.3", "3.4", "5.1"] },
    { "id": 5, "tasks": ["5.2", "5.3", "5.4", "6.1"] },
    { "id": 6, "tasks": ["5.5", "6.2", "7.1", "8.1"] },
    { "id": 7, "tasks": ["6.3", "8.2"] },
    { "id": 8, "tasks": ["10.1", "11.1", "11.2"] },
    { "id": 9, "tasks": ["10.2", "10.3", "10.4", "10.5"] },
    { "id": 10, "tasks": ["12.1", "12.2", "12.3"] },
    { "id": 11, "tasks": ["14.1", "14.2", "14.3"] }
  ]
}
```
