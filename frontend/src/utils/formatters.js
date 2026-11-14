const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
});

const currencyLocales = {
  GBP: 'en-GB',
  NGN: 'en-NG',
  USD: 'en-US',
  EUR: 'en-IE',
};

export function formatDateTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Time to be confirmed' : dateTimeFormatter.format(date);
}

export function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : dateFormatter.format(date);
}

export function formatCurrency(value, currency = 'GBP', rates = {}) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'Price on request';

  const rate = currency === 'GBP' ? 1 : Number(rates[currency]);
  if (!Number.isFinite(rate) || rate <= 0) return 'Rate unavailable';

  return new Intl.NumberFormat(currencyLocales[currency] || 'en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount * rate);
}

export function getLocalDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
