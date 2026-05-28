/// <reference path="../pb_data/types.d.ts" />

/**
 * PocketBase v0.25 Migration: Create all collections for iPhone Store Website
 *
 * Collections:
 * - categories
 * - products
 * - orders
 * - order_items
 * - repair_requests
 * - trade_in_requests
 * - users (extend built-in with role field)
 */

migrate(
  (app) => {
    // ============================================================
    // 1. CATEGORIES COLLECTION
    // ============================================================
    const categories = new Collection({
      name: "categories",
      type: "base",
      system: false,
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
          min: 1,
          max: 200,
        },
        {
          name: "slug",
          type: "text",
          required: true,
          min: 1,
          max: 200,
          pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
        },
        {
          name: "description",
          type: "text",
          required: false,
          max: 1000,
        },
        {
          name: "image",
          type: "file",
          required: false,
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ["image/jpeg", "image/png"],
        },
        {
          name: "sort_order",
          type: "number",
          required: false,
          min: 0,
        },
        {
          name: "is_active",
          type: "bool",
          required: false,
        },
        {
          name: "created",
          type: "autodate",
          onCreate: true,
          onUpdate: false,
        },
        {
          name: "updated",
          type: "autodate",
          onCreate: true,
          onUpdate: true,
        },
      ],
      indexes: ['CREATE UNIQUE INDEX "idx_categories_slug" ON "categories" ("slug")'],
      listRule: "",
      viewRule: "",
      createRule: '@request.auth.id != "" && @request.auth.role = "admin"',
      updateRule: '@request.auth.id != "" && @request.auth.role = "admin"',
      deleteRule: '@request.auth.id != "" && @request.auth.role = "admin"',
    });

    app.save(categories);

    // ============================================================
    // 2. PRODUCTS COLLECTION
    // ============================================================
    const products = new Collection({
      name: "products",
      type: "base",
      system: false,
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
          min: 1,
          max: 200,
        },
        {
          name: "slug",
          type: "text",
          required: true,
          min: 1,
          max: 200,
          pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
        },
        {
          name: "category",
          type: "relation",
          required: false,
          collectionId: categories.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: "condition",
          type: "select",
          required: true,
          values: ["new", "used"],
          maxSelect: 1,
        },
        {
          name: "price",
          type: "number",
          required: true,
          min: 1,
          max: 999999999,
        },
        {
          name: "original_price",
          type: "number",
          required: false,
          min: 1,
          max: 999999999,
        },
        {
          name: "storage",
          type: "text",
          required: true,
          min: 1,
          max: 50,
        },
        {
          name: "color",
          type: "text",
          required: true,
          min: 1,
          max: 100,
        },
        {
          name: "battery_health",
          type: "number",
          required: false,
          min: 0,
          max: 100,
        },
        {
          name: "description",
          type: "text",
          required: true,
          min: 1,
          max: 10000,
        },
        {
          name: "images",
          type: "file",
          required: false,
          maxSelect: 10,
          maxSize: 5242880,
          mimeTypes: ["image/jpeg", "image/png"],
        },
        {
          name: "stock",
          type: "number",
          required: true,
          min: 0,
          max: 9999,
        },
        {
          name: "is_active",
          type: "bool",
          required: false,
        },
        {
          name: "created",
          type: "autodate",
          onCreate: true,
          onUpdate: false,
        },
        {
          name: "updated",
          type: "autodate",
          onCreate: true,
          onUpdate: true,
        },
      ],
      indexes: ['CREATE UNIQUE INDEX "idx_products_slug" ON "products" ("slug")'],
      listRule: "",
      viewRule: "",
      createRule: '@request.auth.id != "" && @request.auth.role = "admin"',
      updateRule: '@request.auth.id != "" && @request.auth.role = "admin"',
      deleteRule: '@request.auth.id != "" && @request.auth.role = "admin"',
    });

    app.save(products);

    // ============================================================
    // 3. ORDERS COLLECTION
    // ============================================================
    const orders = new Collection({
      name: "orders",
      type: "base",
      system: false,
      fields: [
        {
          name: "customer_name",
          type: "text",
          required: true,
          min: 1,
          max: 100,
        },
        {
          name: "customer_phone",
          type: "text",
          required: true,
          min: 10,
          max: 10,
          pattern: "^0[35789]\\d{8}$",
        },
        {
          name: "customer_email",
          type: "email",
          required: false,
        },
        {
          name: "customer_address",
          type: "text",
          required: true,
          min: 1,
          max: 500,
        },
        {
          name: "total_amount",
          type: "number",
          required: true,
          min: 0,
        },
        {
          name: "status",
          type: "select",
          required: true,
          values: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
          maxSelect: 1,
        },
        {
          name: "payment_method",
          type: "select",
          required: true,
          values: ["cod", "bank_transfer"],
          maxSelect: 1,
        },
        {
          name: "notes",
          type: "text",
          required: false,
          max: 1000,
        },
        {
          name: "user",
          type: "relation",
          required: false,
          collectionId: "_pb_users_auth_",
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: "created",
          type: "autodate",
          onCreate: true,
          onUpdate: false,
        },
        {
          name: "updated",
          type: "autodate",
          onCreate: true,
          onUpdate: true,
        },
      ],
      listRule: '@request.auth.id != "" && (@request.auth.role = "admin" || user = @request.auth.id)',
      viewRule: '@request.auth.id != "" && (@request.auth.role = "admin" || user = @request.auth.id)',
      createRule: "",
      updateRule: '@request.auth.id != "" && @request.auth.role = "admin"',
      deleteRule: '@request.auth.id != "" && @request.auth.role = "admin"',
    });

    app.save(orders);

    // ============================================================
    // 4. ORDER_ITEMS COLLECTION
    // ============================================================
    const orderItems = new Collection({
      name: "order_items",
      type: "base",
      system: false,
      fields: [
        {
          name: "order",
          type: "relation",
          required: true,
          collectionId: orders.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: "product",
          type: "relation",
          required: true,
          collectionId: products.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: "quantity",
          type: "number",
          required: true,
          min: 1,
        },
        {
          name: "price",
          type: "number",
          required: true,
          min: 0,
        },
        {
          name: "created",
          type: "autodate",
          onCreate: true,
          onUpdate: false,
        },
        {
          name: "updated",
          type: "autodate",
          onCreate: true,
          onUpdate: true,
        },
      ],
      listRule: '@request.auth.id != "" && (@request.auth.role = "admin" || order.user = @request.auth.id)',
      viewRule: '@request.auth.id != "" && (@request.auth.role = "admin" || order.user = @request.auth.id)',
      createRule: "",
      updateRule: '@request.auth.id != "" && @request.auth.role = "admin"',
      deleteRule: '@request.auth.id != "" && @request.auth.role = "admin"',
    });

    app.save(orderItems);

    // ============================================================
    // 5. REPAIR_REQUESTS COLLECTION
    // ============================================================
    const repairRequests = new Collection({
      name: "repair_requests",
      type: "base",
      system: false,
      fields: [
        {
          name: "customer_name",
          type: "text",
          required: true,
          min: 1,
          max: 100,
        },
        {
          name: "customer_phone",
          type: "text",
          required: true,
          min: 10,
          max: 10,
          pattern: "^0[35789]\\d{8}$",
        },
        {
          name: "device_model",
          type: "text",
          required: true,
          min: 1,
          max: 100,
        },
        {
          name: "issue_description",
          type: "text",
          required: true,
          min: 10,
          max: 1000,
        },
        {
          name: "images",
          type: "file",
          required: false,
          maxSelect: 5,
          maxSize: 5242880,
          mimeTypes: ["image/jpeg", "image/png"],
        },
        {
          name: "status",
          type: "select",
          required: true,
          values: [
            "pending",
            "diagnosing",
            "quoted",
            "confirmed",
            "repairing",
            "completed",
            "delivered",
            "cancelled",
          ],
          maxSelect: 1,
        },
        {
          name: "estimated_cost",
          type: "number",
          required: false,
          min: 0,
        },
        {
          name: "actual_cost",
          type: "number",
          required: false,
          min: 0,
        },
        {
          name: "diagnosis",
          type: "text",
          required: false,
          max: 2000,
        },
        {
          name: "estimated_days",
          type: "number",
          required: false,
          min: 0,
        },
        {
          name: "user",
          type: "relation",
          required: false,
          collectionId: "_pb_users_auth_",
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: "created",
          type: "autodate",
          onCreate: true,
          onUpdate: false,
        },
        {
          name: "updated",
          type: "autodate",
          onCreate: true,
          onUpdate: true,
        },
      ],
      listRule: '@request.auth.id != "" && (@request.auth.role = "admin" || user = @request.auth.id)',
      viewRule: '@request.auth.id != "" && (@request.auth.role = "admin" || user = @request.auth.id)',
      createRule: "",
      updateRule: '@request.auth.id != "" && @request.auth.role = "admin"',
      deleteRule: '@request.auth.id != "" && @request.auth.role = "admin"',
    });

    app.save(repairRequests);

    // ============================================================
    // 6. TRADE_IN_REQUESTS COLLECTION
    // ============================================================
    const tradeInRequests = new Collection({
      name: "trade_in_requests",
      type: "base",
      system: false,
      fields: [
        {
          name: "customer_name",
          type: "text",
          required: true,
          min: 1,
          max: 100,
        },
        {
          name: "customer_phone",
          type: "text",
          required: true,
          min: 10,
          max: 10,
          pattern: "^0[35789]\\d{8}$",
        },
        {
          name: "old_device_model",
          type: "text",
          required: true,
          min: 1,
          max: 100,
        },
        {
          name: "old_device_storage",
          type: "text",
          required: true,
          min: 1,
          max: 50,
        },
        {
          name: "old_device_condition",
          type: "text",
          required: true,
          min: 1,
          max: 1000,
        },
        {
          name: "old_device_battery",
          type: "number",
          required: false,
          min: 0,
          max: 100,
        },
        {
          name: "old_device_images",
          type: "file",
          required: false,
          maxSelect: 5,
          maxSize: 5242880,
          mimeTypes: ["image/jpeg", "image/png"],
        },
        {
          name: "new_product",
          type: "relation",
          required: false,
          collectionId: products.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: "trade_in_value",
          type: "number",
          required: false,
          min: 0,
        },
        {
          name: "price_difference",
          type: "number",
          required: false,
        },
        {
          name: "status",
          type: "select",
          required: true,
          values: [
            "pending",
            "evaluated",
            "confirmed",
            "processing",
            "completed",
            "cancelled",
          ],
          maxSelect: 1,
        },
        {
          name: "admin_notes",
          type: "text",
          required: false,
          max: 2000,
        },
        {
          name: "user",
          type: "relation",
          required: false,
          collectionId: "_pb_users_auth_",
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: "created",
          type: "autodate",
          onCreate: true,
          onUpdate: false,
        },
        {
          name: "updated",
          type: "autodate",
          onCreate: true,
          onUpdate: true,
        },
      ],
      listRule: '@request.auth.id != "" && (@request.auth.role = "admin" || user = @request.auth.id)',
      viewRule: '@request.auth.id != "" && (@request.auth.role = "admin" || user = @request.auth.id)',
      createRule: "",
      updateRule: '@request.auth.id != "" && @request.auth.role = "admin"',
      deleteRule: '@request.auth.id != "" && @request.auth.role = "admin"',
    });

    app.save(tradeInRequests);

    // ============================================================
    // 7. EXTEND USERS COLLECTION WITH ROLE FIELD
    // ============================================================
    const users = app.findCollectionByNameOrId("_pb_users_auth_");

    users.fields.add(
      new SelectField({
        name: "role",
        values: ["user", "admin"],
        maxSelect: 1,
      })
    );

    app.save(users);
  },

  // DOWN MIGRATION (rollback)
  (app) => {
    // Remove role field from users
    const users = app.findCollectionByNameOrId("_pb_users_auth_");
    const roleField = users.fields.getByName("role");
    if (roleField) {
      users.fields.removeById(roleField.id);
      app.save(users);
    }

    // Delete collections in reverse order (respecting relations)
    const tradeIn = app.findCollectionByNameOrId("trade_in_requests");
    if (tradeIn) app.delete(tradeIn);

    const repair = app.findCollectionByNameOrId("repair_requests");
    if (repair) app.delete(repair);

    const orderItems = app.findCollectionByNameOrId("order_items");
    if (orderItems) app.delete(orderItems);

    const orders = app.findCollectionByNameOrId("orders");
    if (orders) app.delete(orders);

    const products = app.findCollectionByNameOrId("products");
    if (products) app.delete(products);

    const categories = app.findCollectionByNameOrId("categories");
    if (categories) app.delete(categories);
  }
);
