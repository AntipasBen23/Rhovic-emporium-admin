export function formatManualPaymentAmount(amount: number, currency = "NGN"): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildPaymentActionKey(orderID: string, action: "approve" | "reject"): string {
  return `${orderID}:${action}`;
}

export function paymentProofDownloadURL(proofID: string, apiURL?: string): string {
  const base = apiURL || "https://rhovic-emporium-backend-production.up.railway.app";
  return `${base}/admin/payment-proofs/${proofID}`;
}
