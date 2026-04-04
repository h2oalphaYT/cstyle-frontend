import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';
type Currency = 'LKR' | 'USD';

interface ThemeContextType {
    theme: Theme;
    currency: Currency;
    toggleTheme: () => void;
    toggleCurrency: () => void;
    convertPrice: (price: number) => number;
    formatPrice: (price: number) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
}

// Exchange rate: 1 USD = 325 LKR (approximate)
const USD_TO_LKR = 325;

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('cstyle-theme');
        return (saved as Theme) || 'dark';
    });

    const [currency, setCurrency] = useState<Currency>(() => {
        const saved = localStorage.getItem('cstyle-currency');
        return (saved as Currency) || 'LKR';
    });

    useEffect(() => {
        localStorage.setItem('cstyle-theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('cstyle-currency', currency);
    }, [currency]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const toggleCurrency = () => {
        setCurrency(prev => prev === 'LKR' ? 'USD' : 'LKR');
    };

    const convertPrice = (priceInUSD: number): number => {
        if (currency === 'USD') {
            return priceInUSD;
        }
        return priceInUSD * USD_TO_LKR;
    };

    const formatPrice = (priceInUSD: number): string => {
        const converted = convertPrice(priceInUSD);
        if (currency === 'USD') {
            return `$${converted.toFixed(2)}`;
        }
        return `Rs ${converted.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const value: ThemeContextType = {
        theme,
        currency,
        toggleTheme,
        toggleCurrency,
        convertPrice,
        formatPrice
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
