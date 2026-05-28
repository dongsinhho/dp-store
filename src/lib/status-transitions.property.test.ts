import { describe, it, expect } from "vitest"
import * as fc from "fast-check"
import {
  validateOrderTransition,
  validateRepairTransition,
  validateTradeInTransition,
} from "./status-transitions"
import {
  OrderStatus,
  RepairStatus,
  TradeInStatus,
  ORDER_STATUS_TRANSITIONS,
  REPAIR_STATUS_TRANSITIONS,
  TRADE_IN_STATUS_TRANSITIONS,
} from "./constants"

// --- Arbitraries ---

const orderStatusArb = fc.constantFrom(...Object.values(OrderStatus))
const repairStatusArb = fc.constantFrom(...Object.values(RepairStatus))
const tradeInStatusArb = fc.constantFrom(...Object.values(TradeInStatus))

// Terminal states (no valid outgoing transitions)
const orderTerminalStatuses: OrderStatus[] = Object.values(OrderStatus).filter(
  (s) => ORDER_STATUS_TRANSITIONS[s].length === 0
)
const repairTerminalStatuses: RepairStatus[] = Object.values(RepairStatus).filter(
  (s) => REPAIR_STATUS_TRANSITIONS[s].length === 0
)
const tradeInTerminalStatuses: TradeInStatus[] = Object.values(TradeInStatus).filter(
  (s) => TRADE_IN_STATUS_TRANSITIONS[s].length === 0
)

// Non-terminal states (have valid outgoing transitions)
const orderNonTerminalStatuses: OrderStatus[] = Object.values(OrderStatus).filter(
  (s) => ORDER_STATUS_TRANSITIONS[s].length > 0
)
const repairNonTerminalStatuses: RepairStatus[] = Object.values(RepairStatus).filter(
  (s) => REPAIR_STATUS_TRANSITIONS[s].length > 0
)
const tradeInNonTerminalStatuses: TradeInStatus[] = Object.values(TradeInStatus).filter(
  (s) => TRADE_IN_STATUS_TRANSITIONS[s].length > 0
)

// Generate a valid transition pair for orders
const validOrderTransitionArb = fc
  .constantFrom(...orderNonTerminalStatuses)
  .chain((from) =>
    fc.constantFrom(...ORDER_STATUS_TRANSITIONS[from]).map((to) => ({ from, to }))
  )

// Generate a valid transition pair for repairs
const validRepairTransitionArb = fc
  .constantFrom(...repairNonTerminalStatuses)
  .chain((from) =>
    fc.constantFrom(...REPAIR_STATUS_TRANSITIONS[from]).map((to) => ({ from, to }))
  )

// Generate a valid transition pair for trade-ins
const validTradeInTransitionArb = fc
  .constantFrom(...tradeInNonTerminalStatuses)
  .chain((from) =>
    fc.constantFrom(...TRADE_IN_STATUS_TRANSITIONS[from]).map((to) => ({ from, to }))
  )

// Generate an invalid transition pair for orders (not in the valid transitions map)
const invalidOrderTransitionArb = fc
  .tuple(orderStatusArb, orderStatusArb)
  .filter(([from, to]) => {
    if (from === to) return false // same-status is tested separately
    const validTargets = ORDER_STATUS_TRANSITIONS[from]
    return !validTargets.includes(to)
  })
  .map(([from, to]) => ({ from, to }))

// Generate an invalid transition pair for repairs
const invalidRepairTransitionArb = fc
  .tuple(repairStatusArb, repairStatusArb)
  .filter(([from, to]) => {
    if (from === to) return false
    const validTargets = REPAIR_STATUS_TRANSITIONS[from]
    return !validTargets.includes(to)
  })
  .map(([from, to]) => ({ from, to }))

// Generate an invalid transition pair for trade-ins
const invalidTradeInTransitionArb = fc
  .tuple(tradeInStatusArb, tradeInStatusArb)
  .filter(([from, to]) => {
    if (from === to) return false
    const validTargets = TRADE_IN_STATUS_TRANSITIONS[from]
    return !validTargets.includes(to)
  })
  .map(([from, to]) => ({ from, to }))

// --- Property 8: Valid order status transitions ---
// Validates: Requirements 4.1, 4.2, 4.3

describe("Property 8: Valid order status transitions", () => {
  it("all valid transitions are accepted", () => {
    fc.assert(
      fc.property(validOrderTransitionArb, ({ from, to }) => {
        const result = validateOrderTransition(from, to)
        expect(result.valid).toBe(true)
        expect(result.error).toBeUndefined()
      })
    )
  })

  it("all invalid transitions are rejected", () => {
    fc.assert(
      fc.property(invalidOrderTransitionArb, ({ from, to }) => {
        const result = validateOrderTransition(from, to)
        expect(result.valid).toBe(false)
        expect(result.error).toBeDefined()
      })
    )
  })

  it("terminal states never allow transitions", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...orderTerminalStatuses),
        orderStatusArb.filter((s) => !orderTerminalStatuses.includes(s)),
        (terminalStatus, targetStatus) => {
          const result = validateOrderTransition(terminalStatus, targetStatus)
          expect(result.valid).toBe(false)
          expect(result.error).toContain("terminal state")
        }
      )
    )
  })

  it("same-status transitions are always rejected", () => {
    fc.assert(
      fc.property(orderStatusArb, (status) => {
        const result = validateOrderTransition(status, status)
        expect(result.valid).toBe(false)
        expect(result.error).toContain("already in")
      })
    )
  })
})

// --- Property 9: Valid repair status transitions ---
// Validates: Requirements 6.1, 6.2, 6.3

describe("Property 9: Valid repair status transitions", () => {
  it("all valid transitions are accepted", () => {
    fc.assert(
      fc.property(validRepairTransitionArb, ({ from, to }) => {
        const result = validateRepairTransition(from, to)
        expect(result.valid).toBe(true)
        expect(result.error).toBeUndefined()
      })
    )
  })

  it("all invalid transitions are rejected", () => {
    fc.assert(
      fc.property(invalidRepairTransitionArb, ({ from, to }) => {
        const result = validateRepairTransition(from, to)
        expect(result.valid).toBe(false)
        expect(result.error).toBeDefined()
      })
    )
  })

  it("terminal states never allow transitions", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...repairTerminalStatuses),
        repairStatusArb.filter((s) => !repairTerminalStatuses.includes(s)),
        (terminalStatus, targetStatus) => {
          const result = validateRepairTransition(terminalStatus, targetStatus)
          expect(result.valid).toBe(false)
          expect(result.error).toContain("terminal state")
        }
      )
    )
  })

  it("same-status transitions are always rejected", () => {
    fc.assert(
      fc.property(repairStatusArb, (status) => {
        const result = validateRepairTransition(status, status)
        expect(result.valid).toBe(false)
        expect(result.error).toContain("already in")
      })
    )
  })
})

// --- Property 10: Valid trade-in status transitions ---
// Validates: Requirements 8.1, 8.2, 8.3

describe("Property 10: Valid trade-in status transitions", () => {
  it("all valid transitions are accepted", () => {
    fc.assert(
      fc.property(validTradeInTransitionArb, ({ from, to }) => {
        const result = validateTradeInTransition(from, to)
        expect(result.valid).toBe(true)
        expect(result.error).toBeUndefined()
      })
    )
  })

  it("all invalid transitions are rejected", () => {
    fc.assert(
      fc.property(invalidTradeInTransitionArb, ({ from, to }) => {
        const result = validateTradeInTransition(from, to)
        expect(result.valid).toBe(false)
        expect(result.error).toBeDefined()
      })
    )
  })

  it("terminal states never allow transitions", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...tradeInTerminalStatuses),
        tradeInStatusArb.filter((s) => !tradeInTerminalStatuses.includes(s)),
        (terminalStatus, targetStatus) => {
          const result = validateTradeInTransition(terminalStatus, targetStatus)
          expect(result.valid).toBe(false)
          expect(result.error).toContain("terminal state")
        }
      )
    )
  })

  it("same-status transitions are always rejected", () => {
    fc.assert(
      fc.property(tradeInStatusArb, (status) => {
        const result = validateTradeInTransition(status, status)
        expect(result.valid).toBe(false)
        expect(result.error).toContain("already in")
      })
    )
  })
})
