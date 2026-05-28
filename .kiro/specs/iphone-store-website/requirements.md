# Requirements Document

## Introduction

Hệ thống website thương mại điện tử chuyên về iPhone, cung cấp 3 dịch vụ chính: Mua bán iPhone (mới/cũ), Sửa chữa iPhone, và Thu cũ đổi mới (Trade-in). Backend sử dụng Pocketbase (authentication, database, file storage, realtime) kết hợp NextJS 14+ App Router cho frontend. Hệ thống được thiết kế self-hosted, nhẹ, và phát triển nhanh.

## Glossary

- **System**: Toàn bộ hệ thống iPhone Store Website bao gồm frontend và backend
- **Storefront**: Giao diện NextJS phía người dùng cuối (khách hàng)
- **Admin_Dashboard**: Giao diện quản trị cho admin quản lý đơn hàng, sản phẩm, yêu cầu
- **Cart**: Giỏ hàng lưu trữ trong localStorage của trình duyệt
- **Pocketbase**: Backend all-in-one xử lý auth, database (SQLite), file storage, realtime
- **Product**: Sản phẩm iPhone (mới hoặc cũ) được bán trên hệ thống
- **Order**: Đơn hàng mua bán iPhone
- **Repair_Request**: Yêu cầu sửa chữa iPhone từ khách hàng
- **Trade_In_Request**: Yêu cầu thu cũ đổi mới iPhone
- **Customer**: Người dùng cuối sử dụng Storefront để mua hàng hoặc gửi yêu cầu
- **Admin**: Người quản trị hệ thống có quyền quản lý sản phẩm, đơn hàng, yêu cầu
- **OrderStatus**: Trạng thái đơn hàng: pending, confirmed, shipping, delivered, cancelled
- **RepairStatus**: Trạng thái sửa chữa: pending, diagnosing, quoted, confirmed, repairing, completed, delivered, cancelled
- **TradeInStatus**: Trạng thái trade-in: pending, evaluated, confirmed, processing, completed, cancelled

## Requirements

### Requirement 1: Product Browsing and Display

**User Story:** As a Customer, I want to browse and view iPhone products, so that I can find the device I want to purchase.

#### Acceptance Criteria

1. WHEN a Customer visits the product listing page, THE Storefront SHALL display a paginated grid of active products with 12 items per page and provide navigation controls to move between pages
2. WHEN a Customer selects a category filter, THE Storefront SHALL display only products belonging to the selected category
3. WHEN a Customer selects a condition filter (new or used), THE Storefront SHALL display only products matching the selected condition
4. WHEN a Customer enters a price range filter with a minimum value between 0 and 999,999,999 VND and a maximum value greater than or equal to the minimum, THE Storefront SHALL display only products with prices within the specified range
5. WHEN a Customer enters a search query of at least 1 character, THE Storefront SHALL display products whose name or description contains the query text using case-insensitive partial matching
6. THE Storefront SHALL only display products where is_active equals true
7. WHEN a Customer clicks on a product, THE Storefront SHALL navigate to the product detail page showing name, price, condition, storage, color, battery health (for used devices only), description, and all associated images
8. THE Storefront SHALL render product pages using Server-Side Rendering with Incremental Static Regeneration revalidating every 60 seconds
9. WHEN a Customer applies filters or a search query that matches no products, THE Storefront SHALL display an empty state message indicating no products were found
10. IF a Customer enters an invalid price range where the minimum value exceeds the maximum value, THEN THE Storefront SHALL display a validation error and not apply the filter
11. WHEN a Customer applies multiple filters simultaneously, THE Storefront SHALL display only products matching all selected filter criteria combined

### Requirement 2: Shopping Cart Management

**User Story:** As a Customer, I want to manage a shopping cart, so that I can collect items before placing an order.

#### Acceptance Criteria

1. WHEN a Customer adds a product to the cart, THE Cart SHALL store the item in localStorage with productId, name, price, quantity, and image
2. WHEN a Customer adds a product that already exists in the cart, THE Cart SHALL increment the existing item quantity by the specified amount
3. WHEN a Customer adds a product that does not exist in the cart, THE Cart SHALL append a new CartItem to the items list
4. THE Cart totalAmount SHALL equal the sum of (price multiplied by quantity) for all items in the cart
5. THE Cart totalItems SHALL equal the sum of all item quantities in the cart
6. WHEN a Customer removes an item from the cart, THE Cart SHALL remove the item and recalculate totalAmount and totalItems
7. WHEN a Customer updates the quantity of a cart item to a value greater than or equal to 1, THE Cart SHALL update the quantity and recalculate totalAmount and totalItems
8. WHEN a Customer clears the cart, THE Cart SHALL remove all items and set totalAmount and totalItems to zero
9. WHEN the page loads and localStorage contains valid cart data, THE Cart SHALL restore its state from localStorage
10. IF the cart data in localStorage is missing or cannot be parsed as valid JSON matching the CartItem schema, THEN THE Cart SHALL initialize with an empty items list and set totalAmount and totalItems to zero
11. IF a Customer attempts to add a product that is inactive or has insufficient stock, THEN THE Cart SHALL reject the addition and not modify the cart state
12. IF a Customer updates the quantity of a cart item to zero, THEN THE Cart SHALL remove that item from the cart and recalculate totalAmount and totalItems

### Requirement 3: Order Placement

**User Story:** As a Customer, I want to place an order, so that I can purchase the iPhones in my cart.

#### Acceptance Criteria

1. WHEN a Customer submits an order, THE System SHALL validate that the cart contains at least one item
2. WHEN a Customer submits an order, THE System SHALL validate that customer_name is non-empty and does not exceed 100 characters
3. WHEN a Customer submits an order, THE System SHALL validate that customer_phone is a valid Vietnamese phone number matching the format of 10 digits starting with 0 followed by one of the prefixes 3, 5, 7, 8, or 9
4. WHEN a Customer submits an order, THE System SHALL validate that customer_address is non-empty and does not exceed 500 characters
5. WHEN a Customer submits an order, THE System SHALL validate that payment_method is either "cod" or "bank_transfer"
6. WHEN a Customer submits an order, THE System SHALL verify that all products in the cart have sufficient stock
7. IF any validation in criteria 1 through 5 fails, THEN THE System SHALL display an error message indicating which field failed validation and not create the Order
8. IF a product in the cart has insufficient stock during checkout, THEN THE System SHALL display an error message indicating the product name and remaining stock quantity and not create the Order
9. WHEN all validations pass, THE System SHALL create an Order record with status "pending" and create OrderItem records for each cart item capturing the product price at the time of purchase
10. WHEN an order is successfully created, THE System SHALL decrement the stock of each ordered product by the ordered quantity
11. WHEN an order is successfully created, THE System SHALL clear the cart
12. THE Order total_amount SHALL equal the sum of (price multiplied by quantity) for all associated OrderItems
13. IF a Customer clicks the order button multiple times, THEN THE System SHALL disable the button after the first click and prevent duplicate order submissions

### Requirement 4: Order Status Management

**User Story:** As an Admin, I want to manage order statuses, so that I can track and fulfill customer orders.

#### Acceptance Criteria

1. THE System SHALL only allow Order status transitions following the valid flow: pending to confirmed, confirmed to shipping, shipping to delivered
2. THE System SHALL allow Order status transition to cancelled only from pending or confirmed states
3. IF an invalid Order status transition is attempted, THEN THE System SHALL reject the transition, maintain the current status, and return an error message indicating the attempted transition is not allowed
4. WHEN an Order status changes, THE System SHALL update the Order record updated timestamp to the current date and time
5. THE System SHALL ensure that product stock remains non-negative after any order creation or cancellation operation
6. WHEN an Order status changes to cancelled, THE System SHALL restore the stock of each product in the order by adding back the ordered quantity
7. THE System SHALL treat delivered and cancelled as terminal states from which no further status transitions are allowed

### Requirement 5: Repair Request Submission

**User Story:** As a Customer, I want to submit a repair request, so that I can get my iPhone fixed.

#### Acceptance Criteria

1. WHEN a Customer submits a repair request, THE System SHALL validate that customer_name is non-empty and does not exceed 100 characters
2. WHEN a Customer submits a repair request, THE System SHALL validate that customer_phone is a valid Vietnamese phone number consisting of exactly 10 digits starting with 0 followed by one of 3, 5, 7, 8, or 9
3. WHEN a Customer submits a repair request, THE System SHALL validate that device_model is non-empty and does not exceed 100 characters
4. WHEN a Customer submits a repair request, THE System SHALL validate that issue_description is non-empty, contains at least 10 characters, and does not exceed 1000 characters
5. IF any required field fails validation, THEN THE System SHALL reject the submission, not create a record, and display a validation error message indicating which fields are invalid
6. WHEN a valid repair request is submitted, THE System SHALL create a Repair_Request record with status "pending"
7. WHERE a Customer provides images with the repair request, THE System SHALL upload up to 5 images to Pocketbase file storage
8. WHEN a repair request is successfully created, THE Storefront SHALL display a confirmation message to the Customer
9. IF a Customer clicks the submit button multiple times, THEN THE System SHALL disable the button after the first click and prevent duplicate repair request submissions

### Requirement 6: Repair Status Management

**User Story:** As an Admin, I want to manage repair request statuses, so that I can track repair progress and communicate with customers.

#### Acceptance Criteria

1. THE System SHALL only allow Repair_Request status transitions following the valid flow: pending to diagnosing, diagnosing to quoted, quoted to confirmed, confirmed to repairing, repairing to completed, completed to delivered
2. THE System SHALL allow Repair_Request status transition to cancelled only from pending or quoted states
3. IF an invalid Repair_Request status transition is attempted, THEN THE System SHALL reject the transition, maintain the current status, and return an error message indicating the current status and the attempted invalid target status
4. WHEN an Admin updates the status to "quoted", THE System SHALL require an estimated_cost value greater than 0
5. IF an Admin attempts to transition a Repair_Request to "quoted" without providing an estimated_cost value or with an estimated_cost of 0 or less, THEN THE System SHALL reject the transition and maintain the current status
6. WHEN a Repair_Request status changes, THE System SHALL update the record timestamp and notify the Customer via Pocketbase realtime subscription

### Requirement 7: Trade-In Request Submission

**User Story:** As a Customer, I want to submit a trade-in request, so that I can exchange my old iPhone for a new one.

#### Acceptance Criteria

1. WHEN a Customer submits a trade-in request, THE System SHALL validate that customer_name is non-empty and does not exceed 100 characters
2. WHEN a Customer submits a trade-in request, THE System SHALL validate that customer_phone is a valid Vietnamese phone number (10 digits starting with 0)
3. WHEN a Customer submits a trade-in request, THE System SHALL validate that old_device_model is non-empty and does not exceed 100 characters
4. WHEN a Customer submits a trade-in request, THE System SHALL validate that old_device_storage is non-empty
5. WHEN a Customer submits a trade-in request, THE System SHALL validate that old_device_condition is non-empty and contains at least 10 characters
6. WHERE a Customer selects a new product for trade-in, THE System SHALL validate that the product exists and is_active equals true
7. IF any validation fails during trade-in request submission, THEN THE System SHALL reject the submission, not create a record, and display a validation error message indicating which fields are invalid
8. WHEN a valid trade-in request is submitted, THE System SHALL create a Trade_In_Request record with status "pending"
9. WHERE a Customer provides images of the old device, THE System SHALL upload a maximum of 5 images to Pocketbase file storage
10. WHEN a trade-in request is successfully created, THE Storefront SHALL display a confirmation message to the Customer

### Requirement 8: Trade-In Evaluation and Processing

**User Story:** As an Admin, I want to evaluate and process trade-in requests, so that I can provide fair pricing and complete exchanges.

#### Acceptance Criteria

1. THE System SHALL only allow Trade_In_Request status transitions following the valid flow: pending to evaluated, evaluated to confirmed, confirmed to processing, processing to completed
2. THE System SHALL allow Trade_In_Request status transition to cancelled only from pending or evaluated states
3. IF an invalid Trade_In_Request status transition is attempted, THEN THE System SHALL reject the transition, maintain the current status, and return an error message indicating the attempted transition is not allowed
4. WHEN an Admin updates the Trade_In_Request status to "evaluated", THE System SHALL require a trade_in_value greater than zero
5. WHEN an Admin evaluates a trade-in that has a new_product specified, THE System SHALL record the trade_in_value and calculate the price_difference as the new product price minus the trade_in_value
6. IF an Admin evaluates a trade-in that has no new_product specified, THEN THE System SHALL record the trade_in_value and set price_difference to null
7. WHEN a Trade_In_Request status changes, THE System SHALL notify the Customer via realtime subscription

### Requirement 9: Product Data Validation

**User Story:** As an Admin, I want product data to be validated, so that only correct information is stored in the system.

#### Acceptance Criteria

1. THE System SHALL validate that Product price is a numeric value greater than zero and not exceeding 999,999,999
2. THE System SHALL validate that Product stock is an integer greater than or equal to zero and not exceeding 9,999
3. WHILE a Product condition is "used", THE System SHALL validate that battery_health is an integer between 0 and 100 inclusive
4. THE System SHALL validate that Product slug is unique across all products
5. WHEN an Admin creates or updates a Product, THE System SHALL auto-generate the Product slug by converting the product name to lowercase, removing diacritics, and replacing spaces and special characters with hyphens
6. THE System SHALL validate that a Product has at least one image and no more than 10 images
7. THE System SHALL validate that Product name is non-empty and does not exceed 200 characters
8. IF any Product validation fails during create or update, THEN THE System SHALL reject the operation, preserve existing data unchanged, and return an error message indicating which field failed validation
9. WHEN an Admin creates or updates a Product, THE System SHALL apply all validation rules before persisting the data

### Requirement 10: Authentication and Authorization

**User Story:** As a system operator, I want proper authentication and authorization, so that data is protected and users can only access appropriate resources.

#### Acceptance Criteria

1. THE System SHALL authenticate users via Pocketbase built-in authentication using email and password or OAuth
2. IF a user provides invalid credentials during authentication, THEN THE System SHALL reject the login attempt and display an error message indicating that the credentials are invalid
3. THE System SHALL restrict Product create, update, and delete operations to Admin users only
4. IF a non-Admin user attempts a Product create, update, or delete operation, THEN THE System SHALL reject the request and return an authorization error without modifying the Product data
5. THE System SHALL allow public read access to active Products
6. THE System SHALL allow authenticated users to create Orders and restrict Order read access to the order owner and Admin users
7. THE System SHALL allow public creation of Repair_Request and Trade_In_Request records and restrict read access to the request owner and Admin users
8. IF an unauthenticated or unauthorized user attempts to access a restricted resource, THEN THE System SHALL reject the request and return an authorization error without exposing the resource data
9. IF a non-Admin user attempts to access the Admin_Dashboard, THEN THE Admin_Dashboard SHALL redirect the user to the login page without granting access to any dashboard content

### Requirement 11: File Upload Handling

**User Story:** As a Customer, I want to upload images with my requests, so that I can provide visual information about my device.

#### Acceptance Criteria

1. THE System SHALL accept only image files with JPG or PNG format for upload, with a maximum of 5 images per request
2. IF a Customer uploads a file exceeding 5MB per file, THEN THE System SHALL reject the file and display a validation error message indicating the maximum allowed file size
3. IF a Customer uploads a file that is not JPG or PNG format, THEN THE System SHALL reject the file and display a validation error message indicating the accepted formats
4. WHEN a Customer uploads valid image files, THE System SHALL store the images in Pocketbase file storage and serve them via the Pocketbase file API
5. IF an image upload fails due to a storage or network error, THEN THE System SHALL display an error message indicating the upload failure and allow the Customer to retry the upload without losing other form data

### Requirement 12: Error Handling and Resilience

**User Story:** As a Customer, I want the system to handle errors gracefully, so that I have a clear understanding of issues and can recover from them.

#### Acceptance Criteria

1. IF the connection to Pocketbase is lost, THEN THE Storefront SHALL display a message indicating the system is under maintenance and attempt reconnection with exponential backoff starting at 1 second, doubling each attempt, up to a maximum interval of 30 seconds, for a maximum of 10 attempts
2. IF a product becomes out of stock between cart addition and checkout, THEN THE System SHALL display a message indicating the product name and remaining stock quantity, preserve the current Cart state, and allow the Customer to update the item quantity or remove the item from the Cart
3. IF a file upload fails validation, THEN THE System SHALL display an error message indicating the accepted formats (JPG, PNG) and maximum size (5MB), retain the form data already entered, and allow the Customer to select a new file without resubmitting the form
4. WHILE the Storefront is unable to reach Pocketbase, THE Storefront SHALL serve cached content via ISR fallback pages and display a notice indicating that displayed information may not reflect current availability
5. IF reconnection to Pocketbase succeeds after a connection loss, THEN THE Storefront SHALL remove the maintenance message and resume normal operation within 3 seconds

### Requirement 13: Responsive Design and SEO

**User Story:** As a Customer, I want the website to work well on all devices and be discoverable via search engines, so that I can access the store from anywhere.

#### Acceptance Criteria

1. THE Storefront SHALL provide a responsive layout that renders without horizontal scrolling and with all interactive elements accessible at viewport widths from 320px to 1920px, using a breakpoint at 768px to distinguish mobile from desktop layouts
2. THE Storefront SHALL render product listing and detail pages using Server-Side Rendering so that the full page content is present in the initial HTML response before client-side JavaScript executes
3. THE Storefront SHALL generate a unique meta title derived from the product name and a meta description derived from the product description for each product detail page, with the title not exceeding 60 characters and the description not exceeding 160 characters
4. THE Storefront SHALL use NextJS Image component with Pocketbase thumbnail API for optimized image loading and SHALL include a descriptive alt attribute on every product image
5. WHEN a search engine crawler requests a product listing or detail page, THE Storefront SHALL return a complete HTML document containing structured product data, canonical URL, and Open Graph meta tags
