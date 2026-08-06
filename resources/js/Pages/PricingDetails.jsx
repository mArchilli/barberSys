import BrandMark from '@/Components/BrandMark';
import BubbleMenu from '@/Components/BubbleMenu';
import FooterSection from '@/Components/FooterSection';
import PricingDetailSection from '@/Components/PricingDetailSection';
import WaveTransition from '@/Components/WaveTransition';
import WhatsAppButton from '@/Components/WhatsAppButton';
import { Head } from '@inertiajs/react';

function PricingBrandLogo() {
    return (
        <span className="inline-flex items-center gap-2.5 text-brand-text">
            <BrandMark
                className="h-7 w-7 sm:h-8 sm:w-8"
                colorClassName="text-brand-text"
            />
            <span className="hidden font-display text-[1.35rem] font-extrabold tracking-[-0.03em] sm:inline">
                Estilus
            </span>
        </span>
    );
}

export default function PricingDetails({
    auth,
    canLogin,
    canRegister,
    plans,
    whatsappSalesNumber,
}) {
    const homeHref = route('home');
    const ctaHref = auth.user
        ? route('dashboard')
        : canRegister
          ? route('register')
          : canLogin
            ? route('login')
            : homeHref;
    const ctaLabel = auth.user ? 'Ir al panel' : 'Probar gratis';
    const whatsappHref =
        `https://wa.me/${whatsappSalesNumber ?? ''}?text=` +
        encodeURIComponent(
            'Hola Estilus, quiero ayuda para elegir el plan indicado para mi barbería.',
        );
    const pageLinks = [
        {
            label: 'Inicio',
            href: homeHref,
            ariaLabel: 'Volver al inicio',
            rotation: -5,
        },
        {
            label: 'Comparativa',
            href: '#comparativa',
            ariaLabel: 'Ir a la comparativa de planes',
            rotation: 4,
        },
        {
            label: 'Cómo elegir',
            href: '#como-elegir',
            ariaLabel: 'Ir a la guía para elegir un plan',
            rotation: -3,
        },
        {
            label: 'Plan Cadena',
            href: '#cadena',
            ariaLabel: 'Ir al detalle del plan Cadena',
            rotation: 5,
        },
        {
            label: 'Dudas',
            href: `${homeHref}#faq`,
            ariaLabel: 'Ir a las dudas frecuentes',
            rotation: -5,
        },
    ];

    return (
        <>
            <Head title="Planes en detalle">
                <meta
                    name="description"
                    content="Compará en detalle los planes de Estilus y elegí el indicado para la operación de tu barbería."
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.bunny.net/css?family=bricolage-grotesque:600,700,800|plus-jakarta-sans:400,500,600,700,800&display=swap"
                />
            </Head>

            <div className="landing-theme min-h-screen bg-brand-bg text-brand-text">
                <header className="relative z-[1001] h-[76px]">
                    <BubbleMenu
                        logo={<PricingBrandLogo />}
                        homeHref={homeHref}
                        logoAriaLabel="Estilus - Volver al inicio"
                        items={pageLinks}
                        menuBg="#FFFFFF"
                        menuContentColor="#242726"
                        itemBg="#FFFFFF"
                        itemHoverBg="#48D5FC"
                        itemContentColor="#242726"
                        actions={[
                            {
                                label: 'Iniciar sesión',
                                href: route('login'),
                                ariaLabel: 'Ir a iniciar sesión',
                            },
                            {
                                label: 'Probar gratis',
                                href: route('register'),
                                ariaLabel: 'Registrarse y probar gratis',
                                primary: true,
                            },
                        ]}
                        useFixedPosition
                    />
                </header>
                <PricingDetailSection
                    plans={plans}
                    cta={{
                        label: ctaLabel,
                        href: ctaHref,
                        inertia: true,
                    }}
                    whatsappSalesNumber={whatsappSalesNumber}
                />
                <WaveTransition
                    fromClassName="text-brand-bg"
                    toClassName="bg-brand-nav-bg"
                />
                <FooterSection
                    homeHref={homeHref}
                    links={pageLinks}
                    whatsappHref={whatsappHref}
                    instagramHref="#"
                />
                <WhatsAppButton
                    href={whatsappHref}
                    label="Consultar por WhatsApp qué plan elegir"
                />
            </div>
        </>
    );
}
