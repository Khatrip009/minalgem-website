import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useCurrency } from './CurrencyContext';   // ✅ uses your live currency rates

const GoldRateContext = createContext(null);

// Default fallback gold price (24K per gram in INR) – used if API fails
const DEFAULT_GOLD_RATE_INR_PER_GRAM = 6500;

export function GoldRateProvider({ children }) {
  const { rates } = useCurrency();   // live INR/USD rates from your existing context

  const [goldRate24kPerGram, setGoldRate24kPerGram] = useState(DEFAULT_GOLD_RATE_INR_PER_GRAM);
  const [loading, setLoading] = useState(true);

  // Fetch gold price from free API (returns USD per troy ounce)
  useEffect(() => {
    const fetchGoldPrice = async () => {
      try {
        // 1. Get gold price in USD per troy ounce
        const goldRes = await fetch('https://api.gold-api.com/price/XAU');
        const goldData = await goldRes.json();
        const goldPriceUsdPerOunce = goldData.price;   // e.g., 2320.45

        // 2. Convert to INR per gram using live currency rate
        const usdToInr = rates?.USD || 0.012;   // default fallback
        const inrPerUsd = 1 / usdToInr;          // how many INR = 1 USD

        // 1 troy ounce = 31.1035 grams
        const goldPriceInrPerGram = (goldPriceUsdPerOunce * inrPerUsd) / 31.1035;

        setGoldRate24kPerGram(goldPriceInrPerGram);
      } catch (error) {
        console.warn('Gold rate fetch failed, using default rate');
        // fallback remains the default
      } finally {
        setLoading(false);
      }
    };

    // Only fetch once we have currency rates
    if (rates && Object.keys(rates).length > 0) {
      fetchGoldPrice();
    }
  }, [rates]);

  /**
   * Calculate estimated gold value for a given product
   * @param {number} goldWeightGrams - weight of pure gold in the piece
   * @param {number} goldCarat - purity (e.g. 22, 18)
   * @returns {number} value in INR
   */
  const getGoldValue = useCallback(
    (goldWeightGrams, goldCarat = 24) => {
      if (!goldWeightGrams || goldWeightGrams <= 0) return 0;
      const purityRatio = (goldCarat / 24);
      return goldWeightGrams * purityRatio * goldRate24kPerGram;
    },
    [goldRate24kPerGram]
  );

  return (
    <GoldRateContext.Provider value={{ goldRate24kPerGram, loading, getGoldValue }}>
      {children}
    </GoldRateContext.Provider>
  );
}

export function useGoldRate() {
  const context = useContext(GoldRateContext);
  if (!context) throw new Error('useGoldRate must be used within GoldRateProvider');
  return context;
}