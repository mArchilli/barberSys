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
        sans: ['Inter', 'sans-serif'],
        display: ['Hanken Grotesk', 'sans-serif'], // títulos/headlines
      },
      colors: {
        brand: {
          bg:                '#F8FBFF',
          surface:           '#FFFFFF',
          'surface-alt':     '#F1F5F9',
          'nav-bg':          '#0F172A', // azul oscuro oficial
          'nav-text':        '#94A3B8',
          'nav-active':      '#00AEEF',
          primary:           '#00AEEF',
          'primary-hover':   '#009BD6',
          'primary-pressed': '#008AC0',
          'primary-soft':    '#E5F7FF',
          'primary-soft-text': '#0369A1',
          text:              '#0F172A',
          'text-secondary':  '#64748B',
          border:            '#E2E8F0',
          'border-subtle':   '#EAF0F6',
          success:           '#10B981',
          'success-soft':    '#ECFDF5',
          danger:            '#EF4444',
          'danger-soft':     '#FEF2F2',
          warning:           '#F59E0B', // no está definido en tu doc, lo dejo como estaba — confirmalo
          // Variantes extendidas para landing y componentes
          'primary-tint':    '#D8F3FF', // badge backgrounds
          'primary-muted':   '#C8EEFF', // hover borders en secondary buttons
          'text-strong':     '#334155', // texto levemente más oscuro que text-secondary
          'text-on-dark':    '#CBD5E1', // texto secundario sobre fondos oscuros
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
        'brand-card': '0 18px 45px rgba(15, 23, 42, 0.06)',
        'brand-card-hover': '0 22px 55px rgba(15, 23, 42, 0.09)',
        'brand-cta': '0 12px 28px rgba(0, 174, 239, 0.22)',
        'brand-floating': '0 28px 70px rgba(15, 23, 42, 0.10)',
      },
    },
  },

    plugins: [forms],
};
