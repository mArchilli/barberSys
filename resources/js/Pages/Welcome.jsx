import CTASection from '@/Components/CTASection';
import FAQSection from '@/Components/FAQSection';
import FeaturesSection from '@/Components/FeaturesSection';
import FooterSection from '@/Components/FooterSection';
import HeroSection from '@/Components/HeroSection';
import Navbar from '@/Components/Navbar';
import PainPointSection from '@/Components/PainPointSection';
import PricingSection from '@/Components/PricingSection';
import StepSection from '@/Components/StepSection';
import WhatsAppButton from '@/Components/WhatsAppButton';
import { Head } from '@inertiajs/react';

const links = [
    { label: 'Funcionalidades', href: '#funcionalidades' },
    { label: 'Cómo funciona', href: '#como-funciona' },
    { label: 'Precios', href: '#precios' },
    { label: 'FAQ', href: '#faq' },
];

export default function Welcome({ auth, canLogin, canRegister }) {
    const ctaHref = auth.user
        ? route('dashboard')
        : canRegister
          ? route('register')
          : canLogin
            ? route('login')
            : '#';
    const whatsappHref =
        'https://wa.me/?text=Hola%20Pelito%2C%20quiero%20conocer%20el%20sistema%20para%20mi%20barber%C3%ADa.';

    return (
        <>
            <Head title="Pelito" />

            <div className="min-h-screen bg-brand-bg text-brand-text">
                <Navbar
                    links={links}
                    cta={{
                        label: 'Probar gratis',
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
                        label: 'Probar gratis',
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
                <StepSection
                    cta={{
                        label: 'Empezar ahora',
                        href: ctaHref,
                        inertia: ctaHref !== '#',
                    }}
                />
                <FeaturesSection
                    cta={{
                        label: 'Configurar cadena',
                        href: ctaHref,
                        inertia: ctaHref !== '#',
                    }}
                />
                <PricingSection
                    cta={{
                        label: 'Probar gratis',
                        href: ctaHref,
                        inertia: ctaHref !== '#',
                    }}
                />
                <CTASection
                    cta={{
                        label: 'Hablar por WhatsApp',
                        href: whatsappHref,
                    }}
                />
                <FAQSection
                    cta={{
                        label: 'Hablar por WhatsApp',
                        href: whatsappHref,
                    }}
                />
                <FooterSection
                    links={links}
                    whatsappHref={whatsappHref}
                    instagramHref="#"
                />
                <WhatsAppButton
                    href={whatsappHref}
                    label="Abrir conversación de WhatsApp con Pelito"
                />
            </div>
        </>
    );
}
