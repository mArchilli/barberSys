import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    server: {
        // Vite >=6.0.9 restringió el CORS por defecto del dev server (antes
        // era Access-Control-Allow-Origin: * para cualquier origen, fix de
        // seguridad). Sin esto, al navegar la app detrás de un túnel (ngrok,
        // necesario para probar redirects de MercadoPago en local) el bundle
        // de React/Inertia no carga desde ese origen — la página queda
        // "estática", sin JS. Los patrones cubren el servidor local de Laravel
        // y cualquier subdominio de ngrok (rota en cada reinicio del túnel
        // gratuito) sin abrir el dev server a cualquier origen arbitrario.
        cors: {
            origin: [
                /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/,
                /^https:\/\/.*\.ngrok-free\.dev$/,
            ],
        },
    },
});
