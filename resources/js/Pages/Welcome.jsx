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
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { useEffect } from 'react';

const links = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'El problema', href: '#pain-points' },
    { label: '¿Cómo funciona?', href: '#funcionalidades' },
    { label: 'Precios', href: '#precios' },
    { label: 'Dudas', href: '#faq' },
];

function SectionOrganicAccent() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none relative z-0 hidden h-0 lg:block"
        >
            <div className="absolute right-0 top-0 h-[26rem] w-[23rem] -translate-y-[38%] overflow-hidden xl:h-[30rem] xl:w-[26rem] 2xl:h-[32rem] 2xl:w-[28rem]">
                <svg
                    viewBox="0 0 520 620"
                    preserveAspectRatio="none"
                    className="absolute -right-14 top-0 h-full w-full text-brand-primary xl:-right-12"
                >
                    <path
                        fill="currentColor"
                        d="M520 28C468 6 401 2 342 20C296 34 269 60 269 96C270 129 278 151 252 174C224 198 163 183 113 207C78 224 72 257 88 294C112 349 158 389 220 421C285 454 353 480 407 519C450 550 458 584 520 600V28Z"
                    />
                </svg>
            </div>
        </div>
    );
}

function FeatureStepOrganicAccent() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none relative z-0 h-0"
        >
            <div className="absolute inset-x-0 -top-10 h-64 overflow-hidden sm:-top-12 sm:h-80 lg:-top-20 lg:h-[30rem] xl:h-[31rem] 2xl:h-[32rem]">
                <svg
                    viewBox="0 0 560 620"
                    preserveAspectRatio="none"
                    className="absolute right-[-6rem] top-0 h-64 w-56 text-brand-primary sm:right-[-8rem] sm:h-80 sm:w-80 lg:right-[-5rem] lg:h-[30rem] lg:w-[31rem] xl:right-[-4rem] xl:h-[31rem] xl:w-[33rem] 2xl:h-[32rem] 2xl:w-[35rem]"
                >
                    <path
                        fill="currentColor"
                        d="M560 18C482 34 392 52 316 82C229 116 151 156 126 207C105 250 119 287 159 318C187 340 231 349 248 378C264 405 246 427 232 452C214 487 225 523 260 548C320 590 432 602 560 616V18Z"
                    />
                </svg>
            </div>
        </div>
    );
}

export default function Welcome({ auth, canLogin, canRegister, plans, whatsappSalesNumber }) {
    useEffect(() => {
        const desktopPointer = window.matchMedia(
            '(min-width: 768px) and (pointer: fine)',
        );
        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        );
        let lenis = null;

        const syncSmoothScroll = () => {
            const shouldUseSmoothScroll =
                desktopPointer.matches && !reducedMotion.matches;

            if (shouldUseSmoothScroll && !lenis) {
                lenis = new Lenis({
                    anchors: { offset: -96 },
                    allowNestedScroll: true,
                    autoRaf: true,
                    autoToggle: true,
                    lerp: 0.085,
                    smoothWheel: true,
                    stopInertiaOnNavigate: true,
                    syncTouch: false,
                    wheelMultiplier: 0.82,
                });
                return;
            }

            if (!shouldUseSmoothScroll && lenis) {
                lenis.destroy();
                lenis = null;
            }
        };

        syncSmoothScroll();
        desktopPointer.addEventListener('change', syncSmoothScroll);
        reducedMotion.addEventListener('change', syncSmoothScroll);

        return () => {
            desktopPointer.removeEventListener('change', syncSmoothScroll);
            reducedMotion.removeEventListener('change', syncSmoothScroll);
            lenis?.destroy();
        };
    }, []);

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
                    loginHref={route('login')}
                    registerHref={route('register')}
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
                <PainPointSection />
                <SectionOrganicAccent />
                <FeaturesSection
                    cta={{
                        label: 'Probar Estilus Barber',
                        href: ctaHref,
                        inertia: ctaHref !== '#',
                    }}
                />
                <FeatureStepOrganicAccent />
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
                            href: route('register'),
                            inertia: true,
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
                    suppressHintWithin="#funcionalidades"
                    whiteAfter="#cta-final"
                />
            </div>
        </>
    );
}
