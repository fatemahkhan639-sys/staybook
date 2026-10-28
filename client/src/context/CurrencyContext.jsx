import { createContext, useContext, useEffect, useState } from 'react';

// Prices are stored in PKR on the server. Conversion here is
// display-only: checkout still sends PKR, so the backend never
// has to guess which currency a total was quoted in.
const CURRENCY_KEY = 'staybook_currency';
const FALLBACK_RATES = { USD: 0.0036, EUR: 0.0033, GBP: 0.0028 };
export const CURRENCIES = ['PKR', 'USD', 'EUR', 'GBP'];

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => localStorage.getItem(CURRENCY_KEY) || 'PKR');
  const [rates, setRates] = useState(FALLBACK_RATES);

  useEffect(() => {
    localStorage.setItem(CURRENCY_KEY, currency);
  }, [currency]);

  useEffect(() => {
    // One public endpoint, no key. If it fails or is slow the
    // static fallback rates above keep prices showing.
    fetch('https://open.er-api.com/v6/latest/PKR')
      .then((res) => res.json())
      .then((data) => {
        if (data?.rates) {
          setRates({
            USD: data.rates.USD || FALLBACK_RATES.USD,
            EUR: data.rates.EUR || FALLBACK_RATES.EUR,
            GBP: data.rates.GBP || FALLBACK_RATES.GBP,
          });
        }
      })
      .catch(() => {});
  }, []);

  function format(pkr) {
    const amount = Number(pkr) || 0;
    if (currency === 'PKR') return `Rs ${Math.round(amount).toLocaleString()}`;
    const converted = amount * (rates[currency] || FALLBACK_RATES[currency]);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(converted);
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
