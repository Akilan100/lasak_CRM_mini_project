export const formatCurrency = (value, options = {}) => {
  const { compact = false } = options;
  const amount = Number(value) || 0;

  if (compact) {
    // Compact notation like 4.2 Lakh, 1.3 Crore using en-IN compact
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    }).format(amount);
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};
