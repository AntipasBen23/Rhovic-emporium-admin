import { describe, expect, it } from "vitest";
import { buildPaymentActionKey, formatManualPaymentAmount, paymentProofDownloadURL } from "../src/lib/manual-payments";

describe("manual payment helpers", () => {
  it("formats pending payment amounts for admin review", () => {
    expect(formatManualPaymentAmount(45000, "NGN")).toBe("₦45,000");
  });

  it("creates stable action keys for approve and reject buttons", () => {
    expect(buildPaymentActionKey("ord_123", "approve")).toBe("ord_123:approve");
    expect(buildPaymentActionKey("ord_123", "reject")).toBe("ord_123:reject");
  });

  it("builds payment proof URLs from custom or default api base urls", () => {
    expect(paymentProofDownloadURL("proof_1", "https://api.example.com")).toBe("https://api.example.com/admin/payment-proofs/proof_1");
    expect(paymentProofDownloadURL("proof_2")).toBe("https://rhovic-emporium-backend-production.up.railway.app/admin/payment-proofs/proof_2");
  });
});
