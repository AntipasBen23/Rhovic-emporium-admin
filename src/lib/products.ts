export function commissionRateLabel(rate: number | null): string {
  return rate != null ? `${(rate * 100).toFixed(1)}%` : "Default (10.0)";
}

export function formatProductPrice(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount / 100);
}

export function parseCommissionRateInput(value: string): number {
  const rateNum = parseFloat(value) / 100;
  if (Number.isNaN(rateNum) || rateNum < 0 || rateNum > 1) {
    throw new Error("Invalid commission rate (must be 0-100%)");
  }
  return rateNum;
}
