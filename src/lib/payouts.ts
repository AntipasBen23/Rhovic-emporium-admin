export function formatPayoutAmount(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function buildPayoutReference(timestamp: number): string {
  return `PAYOUT-${timestamp}`;
}

export function canMarkPayoutPaid(status: string): boolean {
  return status !== "paid";
}
