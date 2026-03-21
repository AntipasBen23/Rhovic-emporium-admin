import { describe, expect, it } from "vitest";
import { commissionRateLabel, formatProductPrice, parseCommissionRateInput } from "../src/lib/products";

describe("admin product helpers", () => {
  it("formats default and custom commission labels for admin product table", () => {
    expect(commissionRateLabel(null)).toBe("Default (10.0)");
    expect(commissionRateLabel(0.175)).toBe("17.5%");
  });

  it("formats backend product prices into naira display strings", () => {
    expect(formatProductPrice(1500000)).toBe("₦15,000");
  });

  it("parses valid commission inputs and rejects invalid ones", () => {
    expect(parseCommissionRateInput("12.5")).toBe(0.125);
    expect(() => parseCommissionRateInput("140")).toThrow("Invalid commission rate");
  });
});
