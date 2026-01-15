export function formatAsCurrency(
  number: number | bigint,
  locale = "en-UG",
  currency = "UGX"
) {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    currencyDisplay: "code", // Use "UGX" instead of "USh" symbol
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(number);
}
