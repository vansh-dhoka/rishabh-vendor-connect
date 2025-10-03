export function formatCurrency(amount, currency = 'INR') {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(Number(amount || 0))
  } catch {
    return String(amount)
  }
}
