import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

const palette = {
    text: '#242726',
    bg: '#EDF1F2',
    surface: '#F8FAFA',
    primary: '#48D5FC',
    'primary-dark': '#12ADD8',
    secondary: '#4E75A5',
    muted: '#697475',
    border: '#C8D0D2',
    dark: '#1D2221',
};

const colorVar = (name) => `rgb(var(${name}) / <alpha-value>)`;

const withOpacity = (hex, alpha) => {
    const normalizedHex = hex.replace('#', '');
    const r = parseInt(normalizedHex.slice(0, 2), 16);
    const g = parseInt(normalizedHex.slice(2, 4), 16);
    const b = parseInt(normalizedHex.slice(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: [
                    'var(--font-sans-family)',
                    ...defaultTheme.fontFamily.sans,
                ],
                display: [
                    'var(--font-display-family)',
                    ...defaultTheme.fontFamily.sans,
                ],
            },
            colors: {
                brand: {
                    bg: colorVar('--brand-bg-rgb'),
                    surface: colorVar('--brand-surface-rgb'),
                    'surface-alt': colorVar('--brand-surface-alt-rgb'),
                    primary: palette.primary,
                    'primary-hover': palette['primary-dark'],
                    'primary-pressed': palette['primary-dark'],
                    'primary-soft': '#DBF5FE',
                    'primary-soft-text': palette.secondary,
                    'primary-tint': '#EAF8FD',
                    'primary-muted': '#BDEFFD',
                    secondary: palette.secondary,
                    // Alias de compatibilidad: el esquema actual no define accent.
                    accent: palette.secondary,
                    link: palette.secondary,
                    'link-hover': colorVar('--brand-link-hover-rgb'),
                    'nav-bg': colorVar('--brand-nav-bg-rgb'),
                    'nav-text': colorVar('--brand-nav-text-rgb'),
                    'nav-active': palette.primary,
                    text: colorVar('--brand-text-rgb'),
                    'text-secondary': colorVar('--brand-text-secondary-rgb'),
                    'text-strong': colorVar('--brand-text-strong-rgb'),
                    'text-on-dark': colorVar('--brand-text-on-dark-rgb'),
                    'on-primary': palette.text,
                    border: colorVar('--brand-border-rgb'),
                    'border-subtle': colorVar('--brand-border-subtle-rgb'),
                    success: '#1F9D68',
                    'success-soft': '#DDF5EA',
                    danger: '#D94B5B',
                    'danger-soft': '#FCECEE',
                    warning: '#D8922C',
                    'warning-soft': '#FBF0DD',
                },
            },
            borderRadius: {
                'brand-sm': '12px',
                'brand-md': '16px',
                'brand-lg': '22px',
                'brand-xl': '32px',
                'brand-pill': '999px',
            },
            boxShadow: {
                'brand-card': `0 18px 45px ${withOpacity(palette.dark, 0.08)}`,
                'brand-card-hover': `0 22px 55px ${withOpacity(palette.dark, 0.12)}`,
                'brand-cta': `0 12px 28px ${withOpacity(palette.primary, 0.24)}`,
                'brand-floating': `0 28px 70px ${withOpacity(palette.dark, 0.14)}`,
            },
        },
    },

    plugins: [forms],
};
