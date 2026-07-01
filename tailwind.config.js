import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

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
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                brand: {
                    'bg':                '#f6f5fb', // violeta muy sutil
                    'surface':           '#ffffff',
                    'nav-bg':            '#18181b',
                    'nav-text':          '#a1a1aa',
                    'nav-active':        '#f4f4f5',
                    'primary':           '#7c3aed',
                    'primary-hover':     '#6d28d9',
                    'accent':            '#8b5cf6',
                    'accent-soft':       '#ede9fe',
                    'accent-soft-text':  '#6d28d9',
                    'text':              '#18181b',
                    'text-secondary':    '#71717a',
                    'border':            '#ececf3',
                    'success':           '#10b981',
                    'success-soft':      '#ecfdf5',
                    'success-soft-text': '#047857',
                    'danger':            '#ef4444',
                    'warning':           '#f59e0b',
                },
            },
            boxShadow: {
                'card': '0 1px 2px rgba(24,24,27,0.04), 0 2px 8px rgba(24,24,27,0.05)',
            },
        },
    },

    plugins: [forms],
};
