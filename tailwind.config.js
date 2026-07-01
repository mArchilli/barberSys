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
                    'bg':            '#fafafa', // zinc-50
                    'surface':       '#ffffff', // white
                    'nav-bg':        '#18181b', // zinc-900
                    'nav-text':      '#a1a1aa', // zinc-400  — inactive links
                    'nav-active':    '#f4f4f5', // zinc-100  — active / hovered links
                    'primary':       '#7c3aed', // violet-600
                    'primary-hover': '#6d28d9', // violet-700
                    'accent':        '#8b5cf6', // violet-500
                    'text':          '#18181b', // zinc-900
                    'text-secondary':'#71717a', // zinc-500
                    'border':        '#e4e4e7', // zinc-200
                    'success':       '#10b981', // emerald-500
                    'danger':        '#ef4444', // red-500
                    'warning':       '#f59e0b', // amber-500
                },
            },
        },
    },

    plugins: [forms],
};
