import CTASection from '@/Components/CTASection';
import CurvedLoop from '@/Components/CurvedLoop';
import FAQSection from '@/Components/FAQSection';
import FeaturesSection from '@/Components/FeaturesSection';
import FooterSection from '@/Components/FooterSection';
import HeroSection from '@/Components/HeroSection';
import Navbar from '@/Components/Navbar';
import PainPointSection from '@/Components/PainPointSection';
import PricingSection from '@/Components/PricingSection';
import StepSection from '@/Components/StepSection';
import WaveTransition from '@/Components/WaveTransition';
import WhatsAppButton from '@/Components/WhatsAppButton';
import { Head } from '@inertiajs/react';

const links = [
    { label: 'Funcionalidades', href: '#funcionalidades' },
    { label: 'Cómo funciona', href: '#como-funciona' },
    { label: 'Precios', href: '#precios' },
    { label: 'FAQ', href: '#faq' },
];

export default function Welcome({ auth, canLogin, canRegister, plans, whatsappSalesNumber }) {
    const ctaHref = auth.user
        ? route('dashboard')
        : canRegister
          ? route('register')
          : canLogin
            ? route('login')
            : '#';
    const primaryCtaLabel = auth.user ? 'Ir al panel' : 'Probar gratis';
    const whatsappHref =
        'https://wa.me/' +
        (whatsappSalesNumber ?? '') +
        '?text=Hola%20Estilus%2C%20quiero%20conocer%20el%20sistema%20para%20mi%20barber%C3%ADa.';

    return (
        <>
            <Head title="Estilus">
                <link
                    rel="stylesheet"
                    href="https://fonts.bunny.net/css?family=bricolage-grotesque:600,700,800|plus-jakarta-sans:400,500,600,700,800&display=swap"
                />
            </Head>

            <div className="landing-theme min-h-screen bg-brand-bg text-brand-text">
                <Navbar
                    links={links}
                    cta={{
                        label: primaryCtaLabel,
                        href: ctaHref,
                        inertia: ctaHref !== '#',
                    }}
                    loginCta={
                        !auth.user && canLogin
                            ? {
                                  label: 'Iniciar sesión',
                                  href: route('login'),
                                  inertia: true,
                              }
                            : null
                    }
                />
                <HeroSection
                    primaryCta={{
                        label: primaryCtaLabel,
                        href: ctaHref,
                        inertia: ctaHref !== '#',
                    }}
                    secondaryCta={{
                        label: 'Cómo funciona',
                        href: '#como-funciona',
                        inertia: false,
                    }}
                />
                <PainPointSection
                    cta={{
                        label: 'Digitalizá tu barbería hoy',
                        href: ctaHref,
                        inertia: ctaHref !== '#',
                    }}
                />
                <FeaturesSection
                    cta={{
                        label: 'Probar Estilus',
                        href: ctaHref,
                        inertia: ctaHref !== '#',
                    }}
                />
                <StepSection
                    cta={{
                        label: 'Empezar ahora',
                        href: ctaHref,
                        inertia: ctaHref !== '#',
                    }}
                />
                <section
                    aria-label="Estilus, ordená tu barbería"
                    className="overflow-hidden"
                >
                    <span className="sr-only">
                        Estilus, ordená tu barbería
                    </span>
                    <CurvedLoop
                        marqueeText="ESTILUS ✦ ORDENÁ TU BARBERÍA ✦"
                        speed={0.55}
                        curveAmount={140}
                        direction="left"
                        interactive
                        className="font-display text-brand-primary"
                    />
                </section>
                <PricingSection
                    plans={plans}
                    cta={{
                        label: primaryCtaLabel,
                        href: ctaHref,
                        inertia: ctaHref !== '#',
                    }}
                    whatsappSalesNumber={whatsappSalesNumber}
                />
                <WaveTransition
                    fromClassName="text-brand-bg"
                    toClassName="bg-brand-primary"
                />
                <div className="bg-brand-primary">
                    <CTASection
                        cta={{
                            label: 'Probar gratis',
                            href: ctaHref,
                            inertia: ctaHref !== '#',
                        }}
                    />
                    <FAQSection
                        cta={{
                            label: 'Hablar por WhatsApp',
                            href: whatsappHref,
                        }}
                    />
                </div>
                <WaveTransition
                    fromClassName="text-brand-primary"
                    toClassName="bg-brand-nav-bg"
                    flip
                />
                <FooterSection
                    links={links}
                    whatsappHref={whatsappHref}
                    instagramHref="#"
                />
                <WhatsAppButton
                    href={whatsappHref}
                    label="Abrir conversación de WhatsApp con Estilus"
                />
            </div>
        </>
    );
}
