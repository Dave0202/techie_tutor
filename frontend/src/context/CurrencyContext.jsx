import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { formatCurrency as formatCurrencyAmount } from '../utils/formatters';

const CURRENCY_STORAGE_KEY = 'vt_currency';
const CURRENCIES = ['GBP', 'NGN', 'USD', 'EUR'];
const CONVERTED_CURRENCIES = ['NGN', 'USD', 'EUR'];
const CurrencyContext = createContext(null);

function getStoredCurrency() {
  const storedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);
  return CURRENCIES.includes(storedCurrency) ? storedCurrency : 'GBP';
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(getStoredCurrency);
  const [rates, setRates] = useState({});
  const [ratesStatus, setRatesStatus] = useState('loading');
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState(null);

  useEffect(() => {
    localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
  }, [currency]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const loadRates = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/GBP', {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!response.ok) throw new Error(`Exchange rate request failed (${response.status}).`);

        const data = await response.json();
        if (data.result !== 'success') throw new Error('Exchange rate service returned an unsuccessful response.');

        const nextRates = {};
        for (const code of CONVERTED_CURRENCIES) {
          const rate = Number(data.rates?.[code]);
          if (!Number.isFinite(rate) || rate <= 0) {
            throw new Error(`Exchange rate for ${code} is unavailable.`);
          }
          nextRates[code] = rate;
        }

        if (!active) return;
        setRates(nextRates);
        setRatesUpdatedAt(data.time_last_update_utc ? new Date(data.time_last_update_utc) : null);
        setRatesStatus('ready');
      } catch (error) {
        if (error.name === 'AbortError' || !active) return;
        setRatesStatus('error');
      }
    };

    loadRates();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const formatCurrency = useCallback((amount) => {
    if (!Number.isFinite(Number(amount))) return 'Price on request';
    if (currency !== 'GBP' && ratesStatus === 'loading') return 'Loading rate…';
    if (currency !== 'GBP' && ratesStatus === 'error') return 'Rate unavailable';
    return formatCurrencyAmount(amount, currency, rates);
  }, [currency, rates, ratesStatus]);

  const value = useMemo(() => ({
    currency,
    setCurrency,
    ratesStatus,
    ratesUpdatedAt,
    formatCurrency,
  }), [currency, ratesStatus, ratesUpdatedAt, formatCurrency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider.');
  return context;
}
