// src/context/CurrencyContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CurrencyContext = createContext(null);

// Default rates (fallback if API fails) – 1 INR = X
const DEFAULT_RATES = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  AED: 0.044,
};

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'INR');
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [loading, setLoading] = useState(true);

  // Fetch live rates on mount
  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/INR')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) {
          setRates({
            INR: 1,
            USD: data.rates.USD,
            EUR: data.rates.EUR,
            GBP: data.rates.GBP,
            AED: data.rates.AED,
          });
        }
      })
      .catch(() => console.warn('Exchange rate fetch failed, using defaults'))
      .finally(() => setLoading(false));
  }, []);

  const changeCurrency = useCallback((newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
  }, []);

  const convertPrice = useCallback(
    (priceInINR) => {
      if (!priceInINR) return 0;
      const rate = rates[currency] || 1;
      return Number((priceInINR * rate).toFixed(2));
    },
    [currency, rates]
  );

  return (
    <CurrencyContext.Provider value={{ currency, rates, loading, changeCurrency, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
}