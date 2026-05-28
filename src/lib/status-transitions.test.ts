import { describe, it, expect } from "vitest"
import {
  validateOrderTransition,
  validateRepairTransition,
  validateTradeInTransition,
} from "./status-transitions"
import { OrderStatus, RepairStatus, TradeInStatus } from "./constants"

describe("validateOrderTransition", () => {
  it("allows pending → confirmed", () => {
    const result = validateOrderTransition(OrderStatus.Pending, OrderStatus.Confirmed)
    expect(result).toEqual({ valid: true })
  })

  it("allows pending → cancelled", () => {
    const result = validateOrderTransition(OrderStatus.Pending, OrderStatus.Cancelled)
    expect(result).toEqual({ valid: true })
  })

  it("allows confirmed → shipping", () => {
    const result = validateOrderTransition(OrderStatus.Confirmed, OrderStatus.Shipping)
    expect(result).toEqual({ valid: true })
  })

  it("allows confirmed → cancelled", () => {
    const result = validateOrderTransition(OrderStatus.Confirmed, OrderStatus.Cancelled)
    expect(result).toEqual({ valid: true })
  })

  it("allows shipping → delivered", () => {
    const result = validateOrderTransition(OrderStatus.Shipping, OrderStatus.Delivered)
    expect(result).toEqual({ valid: true })
  })

  it("rejects transition from delivered (terminal state)", () => {
    const result = validateOrderTransition(OrderStatus.Delivered, OrderStatus.Pending)
    expect(result.valid).toBe(false)
    expect(result.error).toContain("terminal state")
  })

  it("rejects transition from cancelled (terminal state)", () => {
    const result = validateOrderTransition(OrderStatus.Cancelled, OrderStatus.Pending)
    expect(result.valid).toBe(false)
    expect(result.error).toContain("terminal state")
  })

  it("rejects shipping → cancelled (cancellation not allowed from shipping)", () => {
    const result = validateOrderTransition(OrderStatus.Shipping, OrderStatus.Cancelled)
    expect(result.valid).toBe(false)
    expect(result.error).toContain("Cannot transition order")
  })

  it("rejects pending → delivered (skipping steps)", () => {
    const result = validateOrderTransition(OrderStatus.Pending, OrderStatus.Delivered)
    expect(result.valid).toBe(false)
    expect(result.error).toContain("Cannot transition order")
  })

  it("rejects same status transition", () => {
    const result = validateOrderTransition(OrderStatus.Pending, OrderStatus.Pending)
    expect(result.valid).toBe(false)
    expect(result.error).toContain("already in")
  })
})

describe("validateRepairTransition", () => {
  it("allows pending → diagnosing", () => {
    const result = validateRepairTransition(RepairStatus.Pending, RepairStatus.Diagnosing)
    expect(result).toEqual({ valid: true })
  })

  it("allows pending → cancelled", () => {
    const result = validateRepairTransition(RepairStatus.Pending, RepairStatus.Cancelled)
    expect(result).toEqual({ valid: true })
  })

  it("allows diagnosing → quoted", () => {
    const result = validateRepairTransition(RepairStatus.Diagnosing, RepairStatus.Quoted)
    expect(result).toEqual({ valid: true })
  })

  it("allows quoted → confirmed", () => {
    const result = validateRepairTransition(RepairStatus.Quoted, RepairStatus.Confirmed)
    expect(result).toEqual({ valid: true })
  })

  it("allows quoted → cancelled", () => {
    const result = validateRepairTransition(RepairStatus.Quoted, RepairStatus.Cancelled)
    expect(result).toEqual({ valid: true })
  })

  it("allows confirmed → repairing", () => {
    const result = validateRepairTransition(RepairStatus.Confirmed, RepairStatus.Repairing)
    expect(result).toEqual({ valid: true })
  })

  it("allows repairing → completed", () => {
    const result = validateRepairTransition(RepairStatus.Repairing, RepairStatus.Completed)
    expect(result).toEqual({ valid: true })
  })

  it("allows completed → delivered", () => {
    const result = validateRepairTransition(RepairStatus.Completed, RepairStatus.Delivered)
    expect(result).toEqual({ valid: true })
  })

  it("rejects transition from delivered (terminal state)", () => {
    const result = validateRepairTransition(RepairStatus.Delivered, RepairStatus.Pending)
    expect(result.valid).toBe(false)
    expect(result.error).toContain("terminal state")
  })

  it("rejects transition from cancelled (terminal state)", () => {
    const result = validateRepairTransition(RepairStatus.Cancelled, RepairStatus.Pending)
    expect(result.valid).toBe(false)
    expect(result.error).toContain("terminal state")
  })

  it("rejects diagnosing → cancelled (cancellation only from pending or quoted)", () => {
    const result = validateRepairTransition(RepairStatus.Diagnosing, RepairStatus.Cancelled)
    expect(result.valid).toBe(false)
    expect(result.error).toContain("Cannot transition repair request")
  })

  it("rejects confirmed → cancelled (cancellation only from pending or quoted)", () => {
    const result = validateRepairTransition(RepairStatus.Confirmed, RepairStatus.Cancelled)
    expect(result.valid).toBe(false)
    expect(result.error).toContain("Cannot transition repair request")
  })

  it("rejects pending → completed (skipping steps)", () => {
    const result = validateRepairTransition(RepairStatus.Pending, RepairStatus.Completed)
    expect(result.valid).toBe(false)
    expect(result.error).toContain("Cannot transition repair request")
  })

  it("rejects same status transition", () => {
    const result = validateRepairTransition(RepairStatus.Pending, RepairStatus.Pending)
    expect(result.valid).toBe(false)
    expect(result.error).toContain("already in")
  })
})

describe("validateTradeInTransition", () => {
  it("allows pending → evaluated", () => {
    const result = validateTradeInTransition(TradeInStatus.Pending, TradeInStatus.Evaluated)
    expect(result).toEqual({ valid: true })
  })

  it("allows pending → cancelled", () => {
    const result = validateTradeInTransition(TradeInStatus.Pending, TradeInStatus.Cancelled)
    expect(result).toEqual({ valid: true })
  })

  it("allows evaluated → confirmed", () => {
    const result = validateTradeInTransition(TradeInStatus.Evaluated, TradeInStatus.Confirmed)
    expect(result).toEqual({ valid: true })
  })

  it("allows evaluated → cancelled", () => {
    const result = validateTradeInTransition(TradeInStatus.Evaluated, TradeInStatus.Cancelled)
    expect(result).toEqual({ valid: true })
  })

  it("allows confirmed → processing", () => {
    const result = validateTradeInTransition(TradeInStatus.Confirmed, TradeInStatus.Processing)
    expect(result).toEqual({ valid: true })
  })

  it("allows processing → completed", () => {
    const result = validateTradeInTransition(TradeInStatus.Processing, TradeInStatus.Completed)
    expect(result).toEqual({ valid: true })
  })

  it("rejects transition from completed (terminal state)", () => {
    const result = validateTradeInTransition(TradeInStatus.Completed, TradeInStatus.Pending)
    expect(result.valid).toBe(false)
    expect(result.error).toContain("terminal state")
  })

  it("rejects transition from cancelled (terminal state)", () => {
    const result = validateTradeInTransition(TradeInStatus.Cancelled, TradeInStatus.Pending)
    expect(result.valid).toBe(false)
    expect(result.error).toContain("terminal state")
  })

  it("rejects confirmed → cancelled (cancellation only from pending or evaluated)", () => {
    const result = validateTradeInTransition(TradeInStatus.Confirmed, TradeInStatus.Cancelled)
    expect(result.valid).toBe(false)
    expect(result.error).toContain("Cannot transition trade-in request")
  })

  it("rejects pending → completed (skipping steps)", () => {
    const result = validateTradeInTransition(TradeInStatus.Pending, TradeInStatus.Completed)
    expect(result.valid).toBe(false)
    expect(result.error).toContain("Cannot transition trade-in request")
  })

  it("rejects same status transition", () => {
    const result = validateTradeInTransition(TradeInStatus.Pending, TradeInStatus.Pending)
    expect(result.valid).toBe(false)
    expect(result.error).toContain("already in")
  })
})
