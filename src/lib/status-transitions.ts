import {
  OrderStatus,
  RepairStatus,
  TradeInStatus,
  ORDER_STATUS_TRANSITIONS,
  REPAIR_STATUS_TRANSITIONS,
  TRADE_IN_STATUS_TRANSITIONS,
} from "./constants"

export interface TransitionResult {
  valid: boolean
  error?: string
}

/**
 * Validates an order status transition.
 * Valid flow: pending → confirmed → shipping → delivered
 * Cancellation allowed from: pending, confirmed
 * Terminal states: delivered, cancelled (no transitions allowed)
 *
 * Validates: Requirements 4.1, 4.2, 4.3, 4.7
 */
export function validateOrderTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): TransitionResult {
  if (currentStatus === newStatus) {
    return {
      valid: false,
      error: `Order is already in "${currentStatus}" status`,
    }
  }

  const validNextStatuses = ORDER_STATUS_TRANSITIONS[currentStatus]

  if (!validNextStatuses || validNextStatuses.length === 0) {
    return {
      valid: false,
      error: `Cannot transition order from "${currentStatus}" — it is a terminal state`,
    }
  }

  if (!validNextStatuses.includes(newStatus)) {
    return {
      valid: false,
      error: `Cannot transition order from "${currentStatus}" to "${newStatus}". Valid transitions: ${validNextStatuses.join(", ")}`,
    }
  }

  return { valid: true }
}

/**
 * Validates a repair request status transition.
 * Valid flow: pending → diagnosing → quoted → confirmed → repairing → completed → delivered
 * Cancellation allowed from: pending, quoted
 * Terminal states: delivered, cancelled (no transitions allowed)
 *
 * Validates: Requirements 6.1, 6.2, 6.3
 */
export function validateRepairTransition(
  currentStatus: RepairStatus,
  newStatus: RepairStatus
): TransitionResult {
  if (currentStatus === newStatus) {
    return {
      valid: false,
      error: `Repair request is already in "${currentStatus}" status`,
    }
  }

  const validNextStatuses = REPAIR_STATUS_TRANSITIONS[currentStatus]

  if (!validNextStatuses || validNextStatuses.length === 0) {
    return {
      valid: false,
      error: `Cannot transition repair request from "${currentStatus}" — it is a terminal state`,
    }
  }

  if (!validNextStatuses.includes(newStatus)) {
    return {
      valid: false,
      error: `Cannot transition repair request from "${currentStatus}" to "${newStatus}". Valid transitions: ${validNextStatuses.join(", ")}`,
    }
  }

  return { valid: true }
}

/**
 * Validates a trade-in request status transition.
 * Valid flow: pending → evaluated → confirmed → processing → completed
 * Cancellation allowed from: pending, evaluated
 * Terminal states: completed, cancelled (no transitions allowed)
 *
 * Validates: Requirements 8.1, 8.2, 8.3
 */
export function validateTradeInTransition(
  currentStatus: TradeInStatus,
  newStatus: TradeInStatus
): TransitionResult {
  if (currentStatus === newStatus) {
    return {
      valid: false,
      error: `Trade-in request is already in "${currentStatus}" status`,
    }
  }

  const validNextStatuses = TRADE_IN_STATUS_TRANSITIONS[currentStatus]

  if (!validNextStatuses || validNextStatuses.length === 0) {
    return {
      valid: false,
      error: `Cannot transition trade-in request from "${currentStatus}" — it is a terminal state`,
    }
  }

  if (!validNextStatuses.includes(newStatus)) {
    return {
      valid: false,
      error: `Cannot transition trade-in request from "${currentStatus}" to "${newStatus}". Valid transitions: ${validNextStatuses.join(", ")}`,
    }
  }

  return { valid: true }
}
