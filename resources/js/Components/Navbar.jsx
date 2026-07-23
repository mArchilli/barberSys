import BrandMark from '@/Components/BrandMark';
import CardNav from '@/Components/CardNav';
import { useMemo } from 'react';

const defaultLinks = [
    { label: 'Funcionalidades', href: '#funcionalidades' },
    { label: 'Cómo funciona', href: '#como-funciona' },
    { label: 'Precios', href: '#precios' },
    { label: 'FAQ', href: '#faq' },
];

function BrandLogo({ brandName }) {
    return (
        <span className="inline-flex items-center gap-2.5">
            <BrandMark className="h-8 w-8" />
            <span className="font-display text-[1.35rem] font-extrabold tracking-[-0.03em]">
                {brandName}
            </span>
        </span>
    );
}

export default function Navbar({
    brandName = 'Estilus',
    homeHref = '#inicio',
    links = defaultLinks,
    cta = {
        label: 'Probar gratis',
        href: '#precios',
        inertia: false,
    },
    loginCta = null,
}) {
    const items = useMemo(() => {
        const [features, howItWorks, pricing, faq] = links;

        return [
            {
                label: 'Conocé Estilus',
                bgColor: '#48D5FC',
                textColor: '#242726',
                links: [features, howItWorks]
                    .filter(Boolean)
                    .map((link) => ({
                        ...link,
                        ariaLabel: `Ir a ${link.label}`,
                    })),
            },
            {
                label: 'Elegí tu plan',
                bgColor: '#4E75A5',
                textColor: '#F8FAFA',
                links: [
                    pricing && {
                        ...pricing,
                        ariaLabel: `Ir a ${pricing.label}`,
                    },
                    { ...cta, ariaLabel: cta.label },
                ].filter(Boolean),
            },
            {
                label: 'Ayuda',
                bgColor: '#1D2221',
                textColor: '#EDF1F2',
                links: [
                    faq && {
                        ...faq,
                        ariaLabel: 'Ir a preguntas frecuentes',
                    },
                    loginCta && {
                        ...loginCta,
                        ariaLabel: loginCta.label,
                    },
                ].filter(Boolean),
            },
        ];
    }, [cta, links, loginCta]);

    return (
        <CardNav
            logo={<BrandLogo brandName={brandName} />}
            logoAlt={`${brandName} - Ir al inicio`}
            homeHref={homeHref}
            items={items}
            cta={cta}
            baseColor="#F8FAFA"
            menuColor="#242726"
            buttonBgColor="#48D5FC"
            buttonTextColor="#242726"
        />
    );
}
