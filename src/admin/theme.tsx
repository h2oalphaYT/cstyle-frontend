import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { theme as antTheme } from 'antd';
import type { ThemeConfig } from 'antd';

/**
 * One palette for the whole admin panel. Ant Design reads it through ConfigProvider,
 * and Tailwind and the charts read the same values through the --admin-* CSS variables
 * (see index.css), so every surface switches together.
 */
const palettes = {
    light: {
        primary: '#B8941F',      // darker gold keeps links and focus rings readable on white
        link: '#8C6D12',
        layout: '#F5F5F4',
        surface: '#FFFFFF',
        elevated: '#FFFFFF',
        hover: '#F3F4F6',
        border: '#E5E7EB',
        borderStrong: '#D1D5DB',
        text: '#121212',
        muted: '#6B7280',
    },
    dark: {
        primary: '#D4AF37',
        link: '#E8C35A',
        layout: '#0F0F10',
        surface: '#18181B',
        elevated: '#222226',
        hover: '#26262B',
        border: '#2A2A2F',
        borderStrong: '#3A3A40',
        text: '#F1F1F1',
        muted: '#A1A1AA',
    },
} as const;

const buildTheme = (dark: boolean): ThemeConfig => {
    const p = dark ? palettes.dark : palettes.light;
    return {
        algorithm: dark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
            colorPrimary: p.primary,
            colorLink: p.link,
            colorInfo: '#3B82F6',
            colorBgLayout: p.layout,
            colorBgContainer: p.surface,
            colorBgElevated: p.elevated,
            colorBorder: p.borderStrong,
            colorBorderSecondary: p.border,
            colorText: p.text,
            colorTextSecondary: p.muted,
            colorTextDescription: p.muted,
            borderRadius: 8,
            fontFamily: 'Inter, sans-serif',
        },
        components: {
            Layout: { bodyBg: p.layout, headerBg: p.surface, siderBg: p.surface, headerPadding: '0 24px' },
            Menu: {
                itemBg: 'transparent',
                subMenuItemBg: 'transparent',
                itemColor: p.muted,
                itemHoverColor: p.text,
                itemHoverBg: p.hover,
                itemSelectedBg: p.primary,
                itemSelectedColor: '#121212',
                itemActiveBg: p.hover,
                groupTitleColor: p.muted,
                groupTitleFontSize: 11,
                itemHeight: 38,
                itemMarginInline: 8,
                itemBorderRadius: 8,
                iconSize: 16,
                collapsedIconSize: 18,
            },
            // Gold buttons carry dark text: white on gold fails contrast in both modes.
            Button: { primaryColor: '#121212', primaryShadow: 'none' },
            Card: { headerFontSize: 15 },
            Table: { headerBg: dark ? palettes.dark.elevated : '#FAFAF9', rowHoverBg: p.hover },
        },
    };
};

interface AdminTheme {
    isDark: boolean;
    setDark: (dark: boolean) => void;
    antd: ThemeConfig;
}

const AdminThemeContext = createContext<AdminTheme | null>(null);

const STORAGE_KEY = 'admin-theme';
const readStored = () => {
    try { return localStorage.getItem(STORAGE_KEY) === 'dark'; } catch { return false; }
};
const applyClass = (dark: boolean) => document.documentElement.classList.toggle('dark', dark);

export const AdminThemeProvider = ({ children }: { children: ReactNode }) => {
    const [isDark, setIsDark] = useState(() => {
        const dark = readStored();
        // Set the class before the first paint so pages never render in the wrong mode.
        if (typeof document !== 'undefined') applyClass(dark);
        return dark;
    });

    const setDark = useCallback((dark: boolean) => {
        applyClass(dark);
        setIsDark(dark);
        try { localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light'); } catch { /* storage unavailable */ }
    }, []);

    // Leaving the admin restores the storefront's own theme.
    useEffect(() => () => {
        let storeTheme = 'dark';
        try { storeTheme = localStorage.getItem('cstyle-theme') || 'dark'; } catch { /* storage unavailable */ }
        applyClass(storeTheme === 'dark');
    }, []);

    const value = useMemo(() => ({ isDark, setDark, antd: buildTheme(isDark) }), [isDark, setDark]);
    return <AdminThemeContext.Provider value={value}>{children}</AdminThemeContext.Provider>;
};

/** Current admin theme; components re-render when it is toggled. */
export const useAdminTheme = () => {
    const ctx = useContext(AdminThemeContext);
    if (!ctx) throw new Error('useAdminTheme must be used inside AdminThemeProvider');
    return ctx;
};
