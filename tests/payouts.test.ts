import { describe, expect, it } from "vitest";
import { buildPayoutReference, canMarkPayoutPaid, formatPayoutAmount } from "../src/lib/payouts";

describe("payout helpers", () => {
  it("formats payout amounts for admin display", () => {
    expect(formatPayoutAmount(22500)).toBe("₦22,500");
  });

  it("builds predictable payout references from timestamps", () => {
    expect(buildPayoutReference(1740000000000)).toBe("PAYOUT-1740000000000");
  });

  it("allows mark-paid actions only for unpaid payout states", () => {
    expect(canMarkPayoutPaid("queued")).toBe(true);
    expect(canMarkPayoutPaid("unpaid")).toBe(true);
    expect(canMarkPayoutPaid("paid")).toBe(false);
  });
});
