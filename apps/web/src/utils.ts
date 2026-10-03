export function formatDate(isoStr: string | null | undefined): string {
  if (!isoStr) return 'Not Specified';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatCurrency(amount: number | null | undefined, currency: string = 'INR'): string {
  if (amount === null || amount === undefined) return 'Specified in rules';
  return `₹${amount.toLocaleString('en-IN')}`;
}
