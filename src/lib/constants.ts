// Order status enum and valid transitions
export enum OrderStatus {
  Pending = "pending",
  Confirmed = "confirmed",
  Shipping = "shipping",
  Delivered = "delivered",
  Cancelled = "cancelled",
}

// Repair request status enum and valid transitions
export enum RepairStatus {
  Pending = "pending",
  Diagnosing = "diagnosing",
  Quoted = "quoted",
  Confirmed = "confirmed",
  Repairing = "repairing",
  Completed = "completed",
  Delivered = "delivered",
  Cancelled = "cancelled",
}

// Trade-in request status enum and valid transitions
export enum TradeInStatus {
  Pending = "pending",
  Evaluated = "evaluated",
  Confirmed = "confirmed",
  Processing = "processing",
  Completed = "completed",
  Cancelled = "cancelled",
}

// Valid status transitions map
// Each key is the current status, value is an array of valid next statuses

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.Pending]: [OrderStatus.Confirmed, OrderStatus.Cancelled],
  [OrderStatus.Confirmed]: [OrderStatus.Shipping, OrderStatus.Cancelled],
  [OrderStatus.Shipping]: [OrderStatus.Delivered],
  [OrderStatus.Delivered]: [],
  [OrderStatus.Cancelled]: [],
}

export const REPAIR_STATUS_TRANSITIONS: Record<RepairStatus, RepairStatus[]> = {
  [RepairStatus.Pending]: [RepairStatus.Diagnosing, RepairStatus.Cancelled],
  [RepairStatus.Diagnosing]: [RepairStatus.Quoted],
  [RepairStatus.Quoted]: [RepairStatus.Confirmed, RepairStatus.Cancelled],
  [RepairStatus.Confirmed]: [RepairStatus.Repairing],
  [RepairStatus.Repairing]: [RepairStatus.Completed],
  [RepairStatus.Completed]: [RepairStatus.Delivered],
  [RepairStatus.Delivered]: [],
  [RepairStatus.Cancelled]: [],
}

export const TRADE_IN_STATUS_TRANSITIONS: Record<TradeInStatus, TradeInStatus[]> = {
  [TradeInStatus.Pending]: [TradeInStatus.Evaluated, TradeInStatus.Cancelled],
  [TradeInStatus.Evaluated]: [TradeInStatus.Confirmed, TradeInStatus.Cancelled],
  [TradeInStatus.Confirmed]: [TradeInStatus.Processing],
  [TradeInStatus.Processing]: [TradeInStatus.Completed],
  [TradeInStatus.Completed]: [],
  [TradeInStatus.Cancelled]: [],
}
