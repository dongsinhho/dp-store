# Requirements Document

## Introduction

Redesign website Đình Phong Store (dp-store) theo hướng thiết kế hiện đại hơn, cải thiện trải nghiệm người dùng với giao diện đẹp mắt, animation mượt mà, và layout chuyên nghiệp hơn. Toàn bộ tính năng hiện tại (mua bán sản phẩm, giỏ hàng, đặt hàng, sửa chữa, thu cũ đổi mới, admin panel) được giữ nguyên và hoạt động đầy đủ.

## Glossary

- **Website**: Ứng dụng web Đình Phong Store (dp-store) xây dựng bằng Next.js
- **Header**: Thanh điều hướng chính ở đầu trang, chứa logo, menu và giỏ hàng
- **Footer**: Phần chân trang chứa thông tin liên hệ và liên kết
- **Hero_Section**: Khu vực banner chính trên trang chủ
- **Product_Card**: Component hiển thị thông tin tóm tắt của một sản phẩm
- **Product_Grid**: Lưới hiển thị danh sách sản phẩm
- **Service_Card**: Component hiển thị thông tin dịch vụ (sửa chữa, thu cũ)
- **Design_System**: Hệ thống thiết kế bao gồm màu sắc, typography, spacing, và component patterns
- **Animation**: Hiệu ứng chuyển động CSS/JS áp dụng cho các phần tử giao diện
- **Dark_Mode**: Chế độ giao diện tối cho website
- **Responsive_Layout**: Bố cục tự động điều chỉnh theo kích thước màn hình thiết bị
- **Customer_Page**: Các trang dành cho khách hàng (trang chủ, sản phẩm, giỏ hàng, đặt hàng, sửa chữa, thu cũ)
- **Admin_Panel**: Giao diện quản trị dành cho admin

## Requirements

### Requirement 1: Thiết kế Design System hiện đại

**User Story:** As a khách hàng, I want giao diện website trông chuyên nghiệp và hiện đại, so that tôi cảm thấy tin tưởng khi mua sắm.

#### Acceptance Criteria

1. THE Design_System SHALL define a color palette with primary, secondary, accent, neutral, success, warning, and error colors using CSS custom properties, with each semantic color providing at least a base shade and a contrast-accessible foreground shade
2. THE Design_System SHALL use a sans-serif font stack and define a typographic scale with at least 4 heading levels (h1: 30–36px, h2: 24–28px, h3: 20–22px, h4: 16–18px), body text (14–16px), and captions (12–13px), each with a specified line-height value between 1.2 and 1.8
3. THE Design_System SHALL define a spacing scale based on a 4px base unit with at least 8 steps (4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px) applied as CSS custom properties or Tailwind spacing tokens
4. THE Design_System SHALL define border-radius tokens (small: 6px, medium: 12px, large: 16px, full: 9999px) for consistent rounded corners
5. THE Design_System SHALL define shadow tokens (subtle, medium, elevated) as CSS custom properties, where each token specifies explicit box-shadow values with defined x-offset, y-offset, blur-radius, and color opacity
6. THE Design_System SHALL ensure that all text-to-background color combinations in the defined palette meet a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text

### Requirement 2: Redesign Header hiện đại

**User Story:** As a khách hàng, I want thanh điều hướng đẹp và dễ sử dụng, so that tôi có thể tìm kiếm và truy cập các trang nhanh chóng.

#### Acceptance Criteria

1. THE Header SHALL display the store logo with brand typography and an optional icon, positioned as a link to the homepage
2. WHEN the user scrolls the page beyond 0px from the top, THE Header SHALL apply a glassmorphism effect using backdrop-blur and a semi-transparent background with opacity between 0.7 and 0.9, and SHALL remove the effect when the user scrolls back to the top
3. THE Header SHALL display navigation links (Sản phẩm, Sửa chữa, Thu cũ đổi mới) with a hover underline animation that completes within 300ms
4. THE Header SHALL display the cart icon with a badge showing the current item count, where the badge displays the numeric count for values 1–99 and displays "99+" for counts exceeding 99, and the badge is hidden when the count is 0
5. WHEN the viewport width is less than 768px, THE Header SHALL display a hamburger menu button that toggles a slide-in mobile navigation panel from the right side with a transition duration of no more than 300ms
6. WHEN the mobile navigation panel is open, IF the user taps outside the panel or taps the close button or navigates to a link, THEN THE Header SHALL close the mobile navigation panel
7. THE Header SHALL remain fixed at the top of the viewport with a z-index sufficient to overlay page content during scrolling
8. THE Header SHALL maintain all existing navigation links (Sản phẩm, Sửa chữa, Thu cũ đổi mới) and cart functionality including the link to the cart page (/gio-hang)
9. THE Header SHALL provide accessible labels for interactive elements including the cart icon (indicating item count) and the mobile menu toggle button (indicating open/close state via aria-expanded)

### Requirement 3: Redesign Hero Section trang chủ

**User Story:** As a khách hàng, I want trang chủ có phần giới thiệu ấn tượng, so that tôi hiểu ngay được cửa hàng bán gì và có gì đặc biệt.

#### Acceptance Criteria

1. THE Hero_Section SHALL display a full-width gradient background spanning the entire viewport width, with optional decorative elements (geometric shapes, blur effects)
2. WHEN the page finishes loading, THE Hero_Section SHALL display the store headline with a fade-in and slide-up animation completing within 800 milliseconds
3. THE Hero_Section SHALL display a call-to-action button labeled with store action text (e.g., "Xem sản phẩm") that navigates to the product listing page, and WHEN the user hovers over the button, THE Hero_Section SHALL scale the button to 1.05x its original size with a gradient background transition
4. THE Hero_Section SHALL display store contact information including address and hotline number in a badge or pill-shaped container with a background color or border that visually separates it from the surrounding text
5. THE Hero_Section SHALL be fully responsive: on mobile viewports (below 640px) the headline text size SHALL be at minimum 1.875rem, on tablet viewports (640px to 1023px) at minimum 2.25rem, and on desktop viewports (1024px and above) at minimum 3rem
6. THE Hero_Section headline SHALL communicate the store's core offering (iPhone sales) and key value proposition (e.g., chính hãng, giá tốt) so that a first-time visitor can identify the store's business within 5 seconds of page load

### Requirement 4: Redesign Product Card hiện đại

**User Story:** As a khách hàng, I want thẻ sản phẩm trông hấp dẫn và dễ đọc, so that tôi có thể nhanh chóng đánh giá sản phẩm.

#### Acceptance Criteria

1. THE Product_Card SHALL display product image in a square aspect-ratio container with rounded corners (border-radius 8px), and WHEN a user hovers over the image, THE Product_Card SHALL scale the image to 105% with a 300ms ease transition
2. IF the product has an original_price greater than the current price, THEN THE Product_Card SHALL display a discount badge showing the calculated discount percentage, positioned at the top-left corner of the image
3. THE Product_Card SHALL display product name (maximum 2 lines with text truncation), current price in bold, original price with strikethrough (if discounted), storage capacity, color, and battery health percentage (only for products with condition "used") arranged with price visually prominent below the product name and attribute tags grouped below the price
4. THE Product_Card SHALL display a box shadow at rest and WHEN a user hovers over the card, THE Product_Card SHALL increase the shadow elevation with a 200ms ease transition
5. IF the product stock is between 1 and 3 inclusive, THEN THE Product_Card SHALL display a warning text in orange indicating the remaining quantity; IF the product stock equals 0, THEN THE Product_Card SHALL display an "Hết hàng" label in red
6. WHEN a user hovers over the Product_Card, THE Product_Card SHALL display a "Xem chi tiết" button or quick-view overlay with a fade-in transition of 200ms

### Requirement 5: Redesign Product Grid và trang sản phẩm

**User Story:** As a khách hàng, I want trang danh sách sản phẩm được bố trí đẹp mắt, so that tôi có thể duyệt sản phẩm dễ dàng.

#### Acceptance Criteria

1. THE Product_Grid SHALL display products in a responsive grid layout with 1 column on viewports below 640px, 2 columns on viewports from 640px to 1023px, and 3-4 columns on viewports 1024px and above, with a uniform gap of 16px between grid items on mobile and 24px on tablet and desktop
2. WHEN product cards enter the browser viewport, THE Product_Grid SHALL apply a fade-in animation with a staggered delay of 50-100ms between consecutive items and a per-item animation duration of 300ms
3. THE Customer_Page SHALL display filter controls as dropdown menus and selected filter values as dismissible chip elements, and sort controls as a single dropdown menu, on the product listing page
4. THE Customer_Page SHALL display pagination as a row of rounded buttons (border-radius fully rounded) where the current page button is visually distinguished with a filled background color contrasting with inactive page buttons
5. THE Customer_Page SHALL maintain all existing filter functionality (category, condition, price range, search, sort)
6. IF the product listing returns zero results matching the active filters, THEN THE Product_Grid SHALL display an empty state message indicating no products were found and suggesting the customer adjust filters or search terms

### Requirement 6: Redesign trang Giỏ hàng

**User Story:** As a khách hàng, I want trang giỏ hàng rõ ràng và dễ thao tác, so that tôi có thể quản lý đơn hàng trước khi thanh toán.

#### Acceptance Criteria

1. THE Customer_Page SHALL display each cart item as a card containing: product image (minimum 80x80px), product name, unit price, quantity controls (+/- buttons and numeric display), item subtotal (unit price × quantity), and a remove-item button
2. THE Customer_Page SHALL display quantity controls as rounded buttons (border-radius 50%) that update the quantity value with a CSS transition of no more than 300ms duration
3. WHILE the viewport width is at least 1024px, THE Customer_Page SHALL display the cart summary section in a sticky position (fixed relative to the viewport during scroll) showing the total item count and total amount in a visually distinct font size (at least 1.25rem)
4. THE Customer_Page SHALL display the checkout button with a gradient background and a visible state change on hover (opacity, scale, or color shift)
5. WHEN the cart contains zero items, THE Customer_Page SHALL display an empty state with an icon or illustration (minimum 64x64px) and a call-to-action link that navigates to the product listing page (/san-pham)
6. THE Customer_Page SHALL support add-to-cart, remove-from-cart, update-quantity (minimum 1, maximum equal to product stock), and proceed-to-checkout operations without loss of existing functionality
7. IF the user decreases quantity below 1, THEN THE Customer_Page SHALL prevent the action by disabling the decrease button rather than removing the item from the cart

### Requirement 7: Redesign trang Đặt hàng (Checkout)

**User Story:** As a khách hàng, I want quy trình đặt hàng rõ ràng và chuyên nghiệp, so that tôi cảm thấy an tâm khi đặt mua.

#### Acceptance Criteria

1. THE Customer_Page SHALL display the checkout form with top-aligned labels, a visible focus ring on the active input, and rounded borders (border-radius of at least 8px) on all form fields
2. WHEN a form field fails validation, THE Customer_Page SHALL display the corresponding error message below the field with a slide-down animation lasting between 150ms and 300ms, using a red accent color for the error text
3. WHILE the viewport width is at least 768px, THE Customer_Page SHALL display the order summary as a sidebar showing each product name, quantity, unit price, and the order total amount
4. WHILE the viewport width is below 768px, THE Customer_Page SHALL display the order summary as a collapsible section that is expanded by default, showing each product name, quantity, unit price, and the order total amount
5. WHEN the order is successfully submitted, THE Customer_Page SHALL display a success confirmation with an animated checkmark icon (animation duration between 300ms and 600ms), the order ID, and a total amount summary
6. THE Customer_Page SHALL maintain the existing checkout functionality: customer info form (name, phone, email, address, payment method, notes), Zod-based form validation, order creation via server action, stock availability validation with conflict resolution UI, empty-cart guard, and duplicate-submission prevention via button disabling

### Requirement 8: Redesign trang Sửa chữa

**User Story:** As a khách hàng, I want trang dịch vụ sửa chữa trông chuyên nghiệp, so that tôi tin tưởng gửi máy sửa.

#### Acceptance Criteria

1. THE Customer_Page SHALL display repair services in a card grid layout with 1 column on viewports below 768px, 2 columns on viewports 768px–1023px, and 3 columns on viewports 1024px and above, where each card contains an icon, a title, and a description
2. WHEN the customer hovers over a repair service card, THE Customer_Page SHALL translate the card upward by 2–4px with a transition duration between 150ms and 300ms
3. THE Customer_Page SHALL display the repair request form with input fields that have visible borders, consistent border-radius, and focus-state ring indicators matching the color scheme used across other customer-facing pages
4. THE Customer_Page SHALL display the file upload area with a dashed or solid border container that changes border color or background color WHEN the customer drags a file over the drop zone
5. WHEN the repair request form is submitted successfully, THE Customer_Page SHALL display a confirmation icon with a visible entrance animation (fade-in, scale-up, or checkmark draw) that completes within 300ms to 1000ms
6. THE Customer_Page SHALL preserve all existing repair form functionality: client-side and server-side validation of customer_name, customer_phone, device_model, and issue_description fields; file upload accepting JPG/PNG up to 5MB per file with a maximum of 5 files; form submission to the repair_requests collection; and submit button disabled state during submission

### Requirement 9: Redesign trang Thu cũ đổi mới

**User Story:** As a khách hàng, I want trang thu cũ đổi mới dễ hiểu và dễ sử dụng, so that tôi có thể nhanh chóng gửi yêu cầu.

#### Acceptance Criteria

1. THE Customer_Page SHALL display the trade-in process as a 3-step visual guide (Gửi thông tin, Định giá, Hoàn tất) where each step shows a numbered icon and steps are connected by horizontal lines on desktop or vertical lines on mobile
2. THE Customer_Page SHALL display the trade-in form with input fields using rounded borders, gray background (bg-gray-50), focus ring styling, and inline validation error messages consistent with the Design_System
3. THE Customer_Page SHALL display the product selector as a dropdown that filters product options by name as the user types, showing each product's name and formatted price (VND) in the option list
4. THE Customer_Page SHALL display the file upload area as a dashed-border clickable zone with an upload icon and instructional text, supporting both click-to-select and drag-and-drop interactions, matching the repair page upload area styling
5. THE Customer_Page SHALL maintain all existing trade-in functionality: Zod schema validation for required fields (customer_name, customer_phone, old_device_model, old_device_storage, old_device_condition), file upload validation (maximum 5 files, JPG/PNG only, maximum 5MB per file), optional product selection with active-product verification, and form submission to the trade_in_requests collection with status "pending"
6. IF the trade-in form submission fails due to a server error, THEN THE Customer_Page SHALL display an error message indicating the submission failed and allow the user to retry without losing entered form data
7. WHEN the user successfully submits the trade-in form, THEN THE Customer_Page SHALL display a success confirmation view with a success icon, confirmation message, and a button to submit another request

### Requirement 10: Redesign Footer hiện đại

**User Story:** As a khách hàng, I want phần chân trang chứa đầy đủ thông tin liên hệ và trông chuyên nghiệp, so that tôi có thể tìm thông tin cửa hàng dễ dàng.

#### Acceptance Criteria

1. THE Footer SHALL display store information in a multi-column layout with at least 3 distinct sections (brand/tagline, navigation links, contact information), separated by visible spacing or dividers between columns
2. THE Footer SHALL display social media links as clickable icons, where each icon changes color or opacity on hover within 200 milliseconds
3. THE Footer SHALL display contact information including store address, phone number(s), and Facebook link, each preceded by a recognizable icon representing the contact type (location pin, phone, Facebook logo)
4. THE Footer SHALL use a dark background (luminance ≤ 30% of maximum) with a gradient of no more than 2 color stops, and all text SHALL maintain a contrast ratio of at least 4.5:1 against the background (WCAG AA)
5. THE Footer SHALL preserve all existing navigation links (Sản phẩm, Sửa chữa, Thu cũ đổi mới), store name (Đình Phong Store), address (150 Thái Thị Bôi, Thanh Khê, Đà Nẵng), phone numbers (0378 207 593, 0935 462 493), Facebook link, and copyright notice

### Requirement 11: Animation và Micro-interactions

**User Story:** As a khách hàng, I want website có hiệu ứng chuyển động mượt mà, so that trải nghiệm duyệt web cảm thấy sống động và chuyên nghiệp.

#### Acceptance Criteria

1. WHEN a page section enters at least 10% of the viewport, THE Website SHALL apply a fade-in-up animation with a vertical translate distance of 20px to 30px, a duration between 400ms and 600ms, and an ease-out timing function
2. WHEN the user hovers over an interactive element (buttons, cards, links), THE Website SHALL apply a transition with a scale factor between 1.02 and 1.05, an elevation shadow change, and a color shift, with a transition duration between 150ms and 300ms
3. WHEN the user navigates between routes, THE Website SHALL apply a fade transition effect with a duration between 200ms and 400ms to the outgoing and incoming page content
4. IF the user's system has prefers-reduced-motion set to "reduce", THEN THE Website SHALL disable all scroll-triggered animations, hover scale transforms, and page transition effects while preserving immediate state changes (color, opacity) without motion
5. THE Website SHALL ensure that all animations use only composite-friendly CSS properties (transform, opacity) so that Cumulative Layout Shift (CLS) remains below 0.1 and Largest Contentful Paint (LCP) is not delayed by more than 100ms compared to animations-disabled state

### Requirement 12: Responsive Design cải tiến

**User Story:** As a khách hàng sử dụng điện thoại, I want website hiển thị tốt trên mọi thiết bị, so that tôi có thể mua sắm thuận tiện trên điện thoại.

#### Acceptance Criteria

1. THE Responsive_Layout SHALL support three breakpoints: mobile (320px to 639px), tablet (640px to 1024px), and desktop (1025px and above)
2. WHILE the viewport width is less than 640px, THE Responsive_Layout SHALL ensure all interactive elements (buttons, links, form inputs) have a minimum touch target size of 44x44 pixels and a minimum spacing of 8 pixels between adjacent touch targets
3. THE Responsive_Layout SHALL apply a base font size of 14px for mobile viewports, 15px for tablet viewports, and 16px for desktop viewports, with heading elements scaling proportionally at 1.25x (h3), 1.5x (h2), and 2x (h1) of the base size
4. THE Responsive_Layout SHALL ensure no horizontal scrolling occurs at any viewport width from 320px to 1920px, with all content contained within the viewport boundary
5. THE Responsive_Layout SHALL scale spacing values proportionally across breakpoints using a base unit of 4px, with container padding of 16px on mobile, 24px on tablet, and 32px on desktop
6. WHILE the viewport width is less than 640px, THE Responsive_Layout SHALL display the navigation menu in a collapsed state accessible via a toggle button, and SHALL stack product grid items in a single column
7. THE Responsive_Layout SHALL scale images and media elements to fit within their parent container width without exceeding 100% of the container width, maintaining their original aspect ratio

### Requirement 13: Giữ nguyên chức năng Admin Panel

**User Story:** As a admin, I want admin panel vẫn hoạt động đầy đủ sau khi redesign, so that tôi có thể tiếp tục quản lý cửa hàng.

#### Acceptance Criteria

1. THE Admin_Panel SHALL maintain all existing product management functionality including: listing products with pagination, creating a product with image upload, updating a product with image upload, deleting a product, and viewing product details — where each operation produces the same result (success/failure outcome and data changes) as before the redesign given the same inputs
2. THE Admin_Panel SHALL maintain all existing order management functionality including: listing orders with pagination, viewing order details with associated order items, and updating order status through valid transitions (pending → confirmed → shipping → delivered, or cancellation from pending/confirmed with stock restoration)
3. THE Admin_Panel SHALL maintain all existing repair request management functionality including: listing repair requests, viewing repair request details, updating repair request status through valid transitions, and updating diagnosis and estimated cost
4. THE Admin_Panel SHALL maintain all existing trade-in request management functionality including: listing trade-in requests, viewing trade-in request details, updating trade-in status through valid transitions, and setting trade-in valuation with automatic price difference calculation
5. THE Admin_Panel SHALL apply visual updates limited to color, typography, and spacing tokens from the Design_System while preserving the existing page structure, navigation paths, form field order, and multi-step workflows unchanged
6. THE Admin_Panel SHALL require admin authentication for all management operations, rejecting unauthenticated or non-admin requests with an unauthorized error before performing any data modification

### Requirement 14: Performance và Accessibility

**User Story:** As a khách hàng, I want website tải nhanh và dễ tiếp cận, so that tôi có trải nghiệm tốt bất kể thiết bị hay khả năng sử dụng.

#### Acceptance Criteria

1. THE Website SHALL maintain Lighthouse Performance score of 80 or above on mobile using default Lighthouse mobile emulation settings
2. THE Website SHALL maintain Lighthouse Accessibility score of 90 or above
3. THE Website SHALL use semantic HTML elements and ARIA attributes conforming to WAI-ARIA 1.2 specification for all interactive components
4. THE Website SHALL ensure all images have non-empty alt text between 1 and 150 characters that identifies the image content, and use Next.js Image optimization
5. THE Website SHALL ensure color contrast ratios meet WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text)
6. IF a page takes longer than 2 seconds to load content, THEN THE Website SHALL display a skeleton loading placeholder
7. THE Website SHALL ensure all interactive components are operable via keyboard with a visible focus indicator of at least 2px outline and a logical tab order matching the visual reading sequence
