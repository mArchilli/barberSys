import BubbleMenu from '@/Components/BubbleMenu';

const menuItems = [
    {
        label: 'Inicio',
        href: '#inicio',
        ariaLabel: 'Ir al inicio',
        rotation: -5,
    },
    {
        label: 'El problema',
        href: '#pain-points',
        ariaLabel: 'Ir a El problema',
        rotation: 4,
    },
    {
        label: '¿Cómo funciona?',
        href: '#funcionalidades',
        ariaLabel: 'Ir a Cómo funciona',
        rotation: -3,
    },
    {
        label: 'Precios',
        href: '#precios',
        ariaLabel: 'Ir a Precios',
        rotation: 5,
    },
    {
        label: 'Dudas',
        href: '#faq',
        ariaLabel: 'Ir a Dudas frecuentes',
        rotation: -5,
    },
];

export default function Navbar({
    brandName = 'Estilus',
    homeHref = '#inicio',
    loginHref = '/login',
    registerHref = '/register',
}) {
    return (
        <header className="relative z-[1001] h-[76px]">
            <BubbleMenu
                logo="/images/estilus-barber-logo.png"
                homeHref={homeHref}
                logoAriaLabel={`${brandName} - Ir al inicio`}
                items={menuItems}
                menuBg="#FFFFFF"
                menuContentColor="#242726"
                itemBg="#FFFFFF"
                itemHoverBg="#48D5FC"
                itemContentColor="#242726"
                actions={[
                    {
                        label: 'Iniciar sesión',
                        href: loginHref,
                        ariaLabel: 'Ir a iniciar sesión',
                    },
                    {
                        label: 'Probar gratis',
                        href: registerHref,
                        ariaLabel: 'Registrarse y probar gratis',
                        primary: true,
                    },
                ]}
                useFixedPosition
            />
        </header>
    );
}
