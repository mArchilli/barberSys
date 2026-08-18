import AuthLabel from '@/Components/AuthLabel';
import AuthTextInput from '@/Components/AuthTextInput';
import InputError from '@/Components/InputError';
import PasswordInput from '@/Components/PasswordInput';
import PasswordRequirements, {
    PASSWORD_REGEX,
} from '@/Components/PasswordRequirements';
import WhatsAppButton from '@/Components/WhatsAppButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { PLAN_GUIDANCE } from '@/planGuidance';
import { Head, Link, useForm } from '@inertiajs/react';
import { IconArrowLeft, IconArrowRight, IconCheck, IconX } from '@tabler/icons-react';
import axios from 'axios';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const STEPS = [
    'Completá tus datos',
    'Elegí tu plan (todos tienen 14 días gratis)',
    'Configurá tu barbería dentro del sistema',
];

const primaryButtonClass =
    'inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-brand-pill bg-brand-nav-bg px-7 text-base font-bold text-brand-text-on-dark shadow-brand-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-text focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none';

const secondaryButtonClass =
    'inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-brand-pill border border-brand-border bg-brand-surface px-7 text-base font-bold text-brand-text shadow-brand-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-primary-muted hover:bg-brand-surface-alt focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none';

const authLabelClass = 'mb-2 font-display text-base';
const authInputClass = 'min-h-[52px] px-5 py-3 text-base';
const passwordInputClass = 'min-h-[52px] px-5 py-3 pr-12 text-base';

const STEP_NODES = [
    {
        label: STEPS[0],
        desktopPosition: 'left-[20%] top-[3%]',
        mobilePosition: 'left-0 top-3',
        rotation: '-rotate-2',
        shape: '43% 57% 48% 52% / 56% 44% 56% 44%',
    },
    {
        label: STEPS[1],
        desktopPosition: 'right-0 top-[37%]',
        mobilePosition: 'left-1/2 top-0 -translate-x-1/2',
        rotation: 'rotate-2',
        shape: '58% 42% 55% 45% / 44% 57% 43% 56%',
    },
    {
        label: STEPS[2],
        desktopPosition: 'bottom-[2%] right-0',
        mobilePosition: 'right-0 top-3',
        rotation: '-rotate-1',
        shape: '48% 52% 39% 61% / 57% 43% 58% 42%',
    },
];

const MOBILE_STEP_ARROWS = [
    'M80 45 C101 25 122 62 140 45',
    'M220 45 C240 63 260 26 280 45',
];

const DESKTOP_ANCHORS = {
    1: [
        {
            key: 'one-to-two-start',
            className: 'right-[-2px] top-[44%] -translate-y-1/2',
        },
    ],
    2: [
        {
            key: 'one-to-two-end',
            className: 'left-[-2px] top-[44%] -translate-y-1/2',
        },
        {
            key: 'two-to-three-start',
            className: 'bottom-[-2px] left-[45%] -translate-x-1/2',
        },
    ],
    3: [
        {
            key: 'two-to-three-end',
            className: 'left-[48%] top-[-2px] -translate-x-1/2',
        },
    ],
};

const EMPTY_DESKTOP_ARROW_GEOMETRY = {
    width: 1,
    height: 1,
    paths: [],
};

const roundCoordinate = (value) => Math.round(value * 10) / 10;

function getAnchorPoint(anchor, canvasRect) {
    const rect = anchor.getBoundingClientRect();

    return {
        x: roundCoordinate(rect.left - canvasRect.left + rect.width / 2),
        y: roundCoordinate(rect.top - canvasRect.top + rect.height / 2),
    };
}

function createDesktopArrowPaths(anchorRefs, canvasRect) {
    const firstStart = getAnchorPoint(
        anchorRefs['one-to-two-start'],
        canvasRect,
    );
    const firstEnd = getAnchorPoint(
        anchorRefs['one-to-two-end'],
        canvasRect,
    );
    const secondStart = getAnchorPoint(
        anchorRefs['two-to-three-start'],
        canvasRect,
    );
    const secondEnd = getAnchorPoint(
        anchorRefs['two-to-three-end'],
        canvasRect,
    );
    const firstDx = firstEnd.x - firstStart.x;
    const firstDy = firstEnd.y - firstStart.y;
    const secondDy = secondEnd.y - secondStart.y;

    return [
        [
            `M${firstStart.x} ${firstStart.y}`,
            `C${roundCoordinate(firstStart.x + firstDx * 0.3)} ${firstStart.y}`,
            `${roundCoordinate(firstEnd.x - firstDx * 0.3)} ${roundCoordinate(firstEnd.y - firstDy * 0.15)}`,
            `${firstEnd.x} ${firstEnd.y}`,
        ].join(' '),
        [
            `M${secondStart.x} ${secondStart.y}`,
            `C${secondStart.x} ${roundCoordinate(secondStart.y + secondDy * 0.33)}`,
            `${secondEnd.x} ${roundCoordinate(secondEnd.y - secondDy * 0.33)}`,
            `${secondEnd.x} ${secondEnd.y}`,
        ].join(' '),
    ];
}

function useDesktopArrowGeometry(canvasRef, anchorRefs, step) {
    const [geometry, setGeometry] = useState(EMPTY_DESKTOP_ARROW_GEOMETRY);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        const anchors = anchorRefs.current;
        const requiredAnchors = [
            anchors['one-to-two-start'],
            anchors['one-to-two-end'],
            anchors['two-to-three-start'],
            anchors['two-to-three-end'],
        ];

        if (!canvas || requiredAnchors.some((anchor) => !anchor)) {
            return undefined;
        }

        let animationFrame = null;

        const measure = () => {
            const canvasRect = canvas.getBoundingClientRect();
            const nextGeometry = {
                width: roundCoordinate(canvasRect.width),
                height: roundCoordinate(canvasRect.height),
                paths: createDesktopArrowPaths(anchors, canvasRect),
            };

            setGeometry((currentGeometry) => {
                if (
                    currentGeometry.width === nextGeometry.width &&
                    currentGeometry.height === nextGeometry.height &&
                    currentGeometry.paths.every(
                        (path, index) => path === nextGeometry.paths[index],
                    )
                ) {
                    return currentGeometry;
                }

                return nextGeometry;
            });
        };

        const scheduleMeasure = () => {
            if (animationFrame !== null) {
                window.cancelAnimationFrame(animationFrame);
            }

            animationFrame = window.requestAnimationFrame(measure);
        };

        measure();

        const resizeObserver = new ResizeObserver(scheduleMeasure);
        resizeObserver.observe(canvas);

        requiredAnchors.forEach((anchor) => {
            resizeObserver.observe(anchor.closest('li'));
            anchor.closest('li').addEventListener(
                'transitionend',
                scheduleMeasure,
            );
        });

        window.addEventListener('resize', scheduleMeasure);
        const settleTimer = window.setTimeout(measure, 340);

        return () => {
            window.clearTimeout(settleTimer);
            window.removeEventListener('resize', scheduleMeasure);
            requiredAnchors.forEach((anchor) => {
                anchor.closest('li').removeEventListener(
                    'transitionend',
                    scheduleMeasure,
                );
            });
            resizeObserver.disconnect();

            if (animationFrame !== null) {
                window.cancelAnimationFrame(animationFrame);
            }
        };
    }, [anchorRefs, canvasRef, step]);

    return geometry;
}

function StepArrowField({ step, compact = false, desktopGeometry }) {
    const markerId = compact
        ? 'register-step-arrow-mobile'
        : 'register-step-arrow-desktop';
    const activeMarkerId = `${markerId}-active`;
    const mutedMarkerId = `${markerId}-muted`;
    const paths = compact
        ? MOBILE_STEP_ARROWS
        : desktopGeometry?.paths || [];
    const viewBox = compact
        ? '0 0 360 96'
        : `0 0 ${desktopGeometry?.width || 1} ${desktopGeometry?.height || 1}`;
    const visiblePaths = compact
        ? paths.slice(0, Math.min(step, paths.length))
        : paths;

    return (
        <svg
            aria-hidden="true"
            viewBox={viewBox}
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible"
        >
            <defs>
                <marker
                    id={activeMarkerId}
                    markerWidth="11"
                    markerHeight="11"
                    refX="9"
                    refY="5.5"
                    orient="auto"
                    markerUnits="userSpaceOnUse"
                >
                    <path
                        d="M1 1L9 5.5L1 10"
                        fill="none"
                        className="stroke-brand-nav-bg"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </marker>
                <marker
                    id={mutedMarkerId}
                    markerWidth="11"
                    markerHeight="11"
                    refX="9"
                    refY="5.5"
                    orient="auto"
                    markerUnits="userSpaceOnUse"
                >
                    <path
                        d="M1 1L9 5.5L1 10"
                        fill="none"
                        className="stroke-brand-nav-bg opacity-25"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </marker>
            </defs>

            {visiblePaths.map((path, index) => {
                const isReached = step > index + 1;

                return (
                    <path
                        key={`${markerId}-${index}`}
                        d={path}
                        fill="none"
                        className={`register-step-arrow transition-colors duration-300 ${
                            isReached
                                ? 'stroke-brand-nav-bg'
                                : 'stroke-brand-nav-bg/25'
                        }`}
                        strokeWidth={compact ? 2.5 : 3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        markerEnd={`url(#${
                            isReached ? activeMarkerId : mutedMarkerId
                        })`}
                        vectorEffect="non-scaling-stroke"
                    />
                );
            })}
        </svg>
    );
}

function StepNode({
    node,
    number,
    step,
    compact = false,
    desktopAnchorRefs,
}) {
    const isActive = step === number;
    const isDone = step > number;

    return (
        <li
            aria-current={isActive ? 'step' : undefined}
            className={`absolute z-20 flex flex-col items-center justify-center border-2 text-center transition-all duration-300 ${
                compact
                    ? `h-[5.5rem] w-[5.75rem] px-1.5 ${node.mobilePosition}`
                    : `h-28 w-40 px-5 ${node.desktopPosition}`
            } ${node.rotation} bg-brand-primary text-brand-on-primary ${
                isActive
                    ? 'scale-[1.06] border-brand-nav-bg shadow-brand-floating'
                    : isDone
                      ? 'border-brand-nav-bg shadow-brand-card'
                      : 'border-brand-nav-bg/35 shadow-none'
            }`}
            style={{ borderRadius: node.shape }}
        >
            {!compact &&
                DESKTOP_ANCHORS[number].map((anchor) => (
                    <span
                        key={anchor.key}
                        ref={(element) => {
                            desktopAnchorRefs.current[anchor.key] = element;
                        }}
                        aria-hidden="true"
                        className={`pointer-events-none absolute h-px w-px opacity-0 ${anchor.className}`}
                    />
                ))}
            <span
                className={`font-display font-extrabold leading-none ${
                    compact ? 'text-2xl' : 'text-3xl'
                }`}
            >
                {number}
            </span>
            <span
                className={`mt-1 font-semibold leading-tight ${
                    compact ? 'text-[0.55rem]' : 'text-xs'
                }`}
            >
                {node.label}
            </span>
        </li>
    );
}

function StepIndicator({ step }) {
    const desktopCanvasRef = useRef(null);
    const desktopAnchorRefs = useRef({});
    const desktopGeometry = useDesktopArrowGeometry(
        desktopCanvasRef,
        desktopAnchorRefs,
        step,
    );

    return (
        <aside
            aria-label="Progreso del registro"
            className="relative mb-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mb-0 lg:min-h-[35rem] lg:translate-x-6 lg:self-stretch xl:translate-x-10 2xl:translate-x-14"
        >
            <div className="relative h-28 w-full lg:hidden">
                <StepArrowField step={step} compact />
                <ol className="absolute inset-0">
                    {STEP_NODES.map((node, index) => (
                        <StepNode
                            key={`mobile-${node.label}`}
                            node={node}
                            number={index + 1}
                            step={step}
                            compact
                        />
                    ))}
                </ol>
            </div>

            <div
                ref={desktopCanvasRef}
                className="relative hidden h-full min-h-[35rem] w-full lg:block"
            >
                <StepArrowField
                    step={step}
                    desktopGeometry={desktopGeometry}
                />
                <ol className="absolute inset-0">
                    {STEP_NODES.map((node, index) => (
                        <StepNode
                            key={`desktop-${node.label}`}
                            node={node}
                            number={index + 1}
                            step={step}
                            desktopAnchorRefs={desktopAnchorRefs}
                        />
                    ))}
                </ol>
            </div>
        </aside>
    );
}

export default function Register({ plans, whatsappSalesNumber }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        plan_id: plans?.[0]?.id ?? '',
        barberia_name: '',
        coupon_code: '',
    });

    const [step, setStep] = useState(1);
    const whatsappHref =
        `https://wa.me/${whatsappSalesNumber ?? ''}?text=` +
        encodeURIComponent(
            'Hola Estilus, necesito ayuda para crear mi cuenta.',
        );
    const [stepErrors, setStepErrors] = useState({});
    const [couponStatus, setCouponStatus] = useState('idle');
    const [couponMessage, setCouponMessage] = useState('');

    useEffect(() => {
        const code = data.coupon_code.trim();

        if (!code) {
            setCouponStatus('idle');
            setCouponMessage('');
            return;
        }

        setCouponStatus('checking');

        const timeout = setTimeout(() => {
            axios
                .post(route('coupons.check'), { code, plan_id: data.plan_id })
                .then(({ data: result }) => {
                    setCouponStatus(result.valid ? 'valid' : 'invalid');
                    setCouponMessage(result.message);
                })
                .catch(() => {
                    setCouponStatus('invalid');
                    setCouponMessage('No pudimos validar el cupón.');
                });
        }, 500);

        return () => clearTimeout(timeout);
    }, [data.coupon_code, data.plan_id]);

    useEffect(() => {
        if (errors.name || errors.email || errors.password || errors.password_confirmation) {
            setStep(1);
        } else if (errors.plan_id || errors.coupon_code) {
            setStep(2);
        } else if (errors.barberia_name) {
            setStep(3);
        }
    }, [errors]);

    const formatPrice = (plan) => {
        if (plan.is_custom) return 'A medida';
        return `$${Number(plan.price).toLocaleString('es-AR')}`;
    };

    const formatCapacity = (plan) => {
        if (plan.is_custom) return 'Capacidad a medida';

        const barberias = `${plan.max_barberias} ${
            plan.max_barberias === 1 ? 'barbería' : 'barberías'
        }`;
        const barberos =
            plan.max_barberos === null
                ? 'Barberos sin límite'
                : `Hasta ${plan.max_barberos} barberos`;

        return `${barberias} · ${barberos}`;
    };

    const errorFor = (field) => errors[field] || stepErrors[field];

    const setField = (field, value) => {
        setData(field, value);
        if (stepErrors[field]) {
            setStepErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const validateStep1 = () => {
        const errs = {};
        if (!data.name.trim()) errs.name = 'Ingresá tu nombre.';
        if (!data.email.trim()) errs.email = 'Ingresá tu email.';
        if (!PASSWORD_REGEX.test(data.password)) {
            errs.password = 'La contraseña no cumple los requisitos.';
        }
        if (data.password_confirmation !== data.password) {
            errs.password_confirmation = 'Las contraseñas no coinciden.';
        }
        return errs;
    };

    const validateStep3 = () => {
        const errs = {};
        if (!data.barberia_name.trim()) {
            errs.barberia_name = 'Ingresá el nombre de tu barbería.';
        }
        return errs;
    };

    const goNext = () => {
        if (step === 1) {
            const errs = validateStep1();
            setStepErrors(errs);
            if (Object.keys(errs).length) return;
        }
        setStepErrors({});
        setStep((s) => Math.min(3, s + 1));
    };

    const goBack = () => {
        setStepErrors({});
        setStep((s) => Math.max(1, s - 1));
    };

    const submit = (e) => {
        e.preventDefault();
        if (step !== 3) return;

        const errs = validateStep3();
        setStepErrors(errs);
        if (Object.keys(errs).length) return;

        if (data.coupon_code.trim() && couponStatus === 'invalid') {
            setStep(2);
            return;
        }

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <GuestLayout
                registerBackground
                maxWidth="min-w-0 sm:max-w-[1440px]"
            >
                <Head title="Crear cuenta" />

                <div
                    className={`mx-auto grid min-w-0 w-full max-w-[30rem] grid-cols-[minmax(0,1fr)] lg:max-w-none lg:grid-rows-[auto_1fr] ${
                        step === 2
                            ? 'lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-x-12 xl:gap-x-20'
                            : 'lg:grid-cols-[minmax(0,30rem)_minmax(16rem,1fr)] lg:gap-x-20 xl:gap-x-32'
                    }`}
                >
                    <div
                        className={`mb-8 text-center lg:col-start-1 lg:row-start-1 ${
                            step === 2
                                ? 'lg:-translate-x-[clamp(0rem,calc(26.667vw-24rem),8rem)]'
                                : ''
                        }`}
                    >
                        <h1 className="font-display text-4xl font-extrabold tracking-[-0.03em] text-brand-text sm:text-[2.625rem]">
                            Creá tu cuenta en Estilus Barber
                        </h1>
                        <p className="mt-3 text-base leading-7 text-brand-text-secondary">
                            ¿Todavía dudás?{' '}
                            <span className="pricing-wavy-underline login-wavy-underline font-semibold">
                                Tenés 14 días de prueba gratis.
                            </span>
                        </p>
                    </div>

                    <StepIndicator step={step} />

                    <form
                        onSubmit={submit}
                        className={`min-w-0 lg:col-start-1 lg:row-start-2 ${
                            step === 2
                                ? 'lg:-translate-x-[clamp(0rem,calc(26.667vw-24rem),8rem)]'
                                : ''
                        }`}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && step < 3)
                                e.preventDefault();
                        }}
                    >
                {step === 1 && (
                    <div className="space-y-6">
                        <div>
                            <AuthLabel
                                htmlFor="name"
                                value="Nombre"
                                className={authLabelClass}
                            />
                            <AuthTextInput
                                id="name"
                                name="name"
                                value={data.name}
                                autoComplete="name"
                                isFocused={true}
                                error={!!errorFor('name')}
                                placeholder="Tu nombre completo"
                                className={authInputClass}
                                onChange={(e) => setField('name', e.target.value)}
                            />
                            <InputError message={errorFor('name')} className="mt-2" />
                        </div>

                        <div>
                            <AuthLabel
                                htmlFor="email"
                                value="Email"
                                className={authLabelClass}
                            />
                            <AuthTextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                autoComplete="username"
                                error={!!errorFor('email')}
                                placeholder="tu@email.com"
                                className={authInputClass}
                                onChange={(e) => setField('email', e.target.value)}
                            />
                            <InputError message={errorFor('email')} className="mt-2" />
                        </div>

                        <div>
                            <AuthLabel
                                htmlFor="password"
                                value="Contraseña"
                                className={authLabelClass}
                            />
                            <PasswordInput
                                id="password"
                                name="password"
                                value={data.password}
                                autoComplete="new-password"
                                error={!!errorFor('password')}
                                placeholder="••••••••"
                                className={passwordInputClass}
                                onChange={(e) => setField('password', e.target.value)}
                            />
                            <PasswordRequirements
                                password={data.password}
                                horizontal
                            />
                            <InputError message={errorFor('password')} className="mt-2" />
                        </div>

                        <div>
                            <AuthLabel
                                htmlFor="password_confirmation"
                                value="Confirmar contraseña"
                                className={authLabelClass}
                            />
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                autoComplete="new-password"
                                error={!!errorFor('password_confirmation')}
                                placeholder="••••••••"
                                className={passwordInputClass}
                                onChange={(e) =>
                                    setField('password_confirmation', e.target.value)
                                }
                            />
                            <InputError
                                message={errorFor('password_confirmation')}
                                className="mt-2"
                            />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="mr-auto w-full max-w-[50rem]">
                        <div className="grid gap-3 sm:grid-cols-2">
                            {plans.map((plan) => {
                                const selected = data.plan_id === plan.id;
                                const guidance = PLAN_GUIDANCE[plan.slug];

                                return (
                                    <label
                                        key={plan.id}
                                        className={`relative flex h-full cursor-pointer flex-col rounded-brand-lg border-2 p-3.5 text-left transition-all duration-150 focus-within:ring-2 focus-within:ring-brand-text focus-within:ring-offset-2 ${
                                            selected
                                                ? 'border-brand-primary bg-brand-primary-soft shadow-brand-card'
                                                : 'border-brand-border bg-brand-surface hover:border-brand-primary-muted'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="plan_id"
                                            value={plan.id}
                                            checked={selected}
                                            onChange={() => setData('plan_id', plan.id)}
                                            className="sr-only"
                                        />
                                        {selected && (
                                            <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-brand-on-primary">
                                                <IconCheck className="h-3 w-3" stroke={3} />
                                            </span>
                                        )}
                                        <span className="pr-7 text-base font-bold text-brand-text">
                                            {plan.name}
                                        </span>
                                        <span className="mt-1.5 font-display text-2xl font-extrabold tracking-[-0.04em] text-brand-text">
                                            {formatPrice(plan)}
                                            {!plan.is_custom && (
                                                <span className="ml-1 text-sm font-medium text-brand-text-secondary">
                                                    /mes
                                                </span>
                                            )}
                                        </span>
                                        <p className="mt-2 text-[11px] leading-4 text-brand-text-secondary lg:hidden xl:block xl:text-xs xl:leading-[1.15rem]">
                                            {guidance?.summary}
                                        </p>
                                        <p className="mt-2 hidden text-[11px] leading-4 text-brand-text-secondary lg:block xl:hidden">
                                            {formatCapacity(plan)}
                                        </p>
                                        <p className="mt-2 border-t border-brand-border-subtle pt-2 text-[11px] font-semibold leading-4 text-brand-text xl:text-xs xl:leading-[1.15rem]">
                                            {guidance?.decision}
                                        </p>
                                    </label>
                                );
                            })}
                        </div>
                        <InputError message={errorFor('plan_id')} className="mt-3" />

                        <div className="mt-4 lg:grid lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start lg:gap-x-4">
                            <AuthLabel
                                htmlFor="coupon_code"
                                value="Código de cupón (opcional)"
                                className={`${authLabelClass} lg:mb-0 lg:mt-3 lg:text-sm`}
                            />
                            <div className="min-w-0">
                                <AuthTextInput
                                    id="coupon_code"
                                    name="coupon_code"
                                    value={data.coupon_code}
                                    error={couponStatus === 'invalid'}
                                    placeholder="Ej: BIENVENIDA20"
                                    className="min-h-[46px] px-4 py-2.5 text-sm"
                                    onChange={(e) => setField('coupon_code', e.target.value.toUpperCase())}
                                />
                                {couponStatus === 'checking' && (
                                    <p className="mt-1.5 text-xs text-brand-text-secondary">Validando cupón…</p>
                                )}
                                {couponStatus === 'valid' && (
                                    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-brand-success">
                                        <IconCheck className="h-3.5 w-3.5" stroke={2.6} />
                                        {couponMessage}
                                    </p>
                                )}
                                {couponStatus === 'invalid' && (
                                    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-brand-danger">
                                        <IconX className="h-3.5 w-3.5" stroke={2.6} />
                                        {couponMessage}
                                    </p>
                                )}
                                <InputError message={errors.coupon_code} className="mt-2" />
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <div>
                            <AuthLabel
                                htmlFor="barberia_name"
                                value="Nombre de tu barbería"
                                className={authLabelClass}
                            />
                            <AuthTextInput
                                id="barberia_name"
                                name="barberia_name"
                                value={data.barberia_name}
                                isFocused={true}
                                error={!!errorFor('barberia_name')}
                                placeholder="Ej: Barbería Central"
                                className={authInputClass}
                                onChange={(e) => setField('barberia_name', e.target.value)}
                            />
                            <InputError message={errorFor('barberia_name')} className="mt-2" />
                        </div>
                    </div>
                )}

                <div
                    className={`flex items-center justify-between gap-4 ${
                        step === 2
                            ? 'mr-auto mt-4 w-full max-w-[50rem]'
                            : 'mt-10'
                    }`}
                >
                    {step > 1 ? (
                        <button type="button" onClick={goBack} className={secondaryButtonClass}>
                            <IconArrowLeft className="h-5 w-5" stroke={2.4} />
                            <span>Anterior</span>
                        </button>
                    ) : (
                        <Link
                            href={route('login')}
                            className="pricing-wavy-underline login-wavy-underline text-base font-semibold text-brand-link hover:text-brand-link-hover focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
                        >
                            ¿Ya tenés cuenta?
                        </Link>
                    )}

                    {step < 3 ? (
                        <button type="button" onClick={goNext} className={primaryButtonClass}>
                            <span>Siguiente</span>
                            <IconArrowRight className="h-5 w-5" stroke={2.4} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={submit}
                            disabled={processing}
                            className={primaryButtonClass}
                        >
                            <span>{processing ? 'Creando cuenta…' : 'Crear cuenta'}</span>
                            <IconArrowRight className="h-5 w-5" stroke={2.4} />
                        </button>
                    )}
                </div>
                    </form>
                </div>
            </GuestLayout>
            <WhatsAppButton
                href={whatsappHref}
                label="Consultar por WhatsApp sobre el registro"
            />
        </>
    );
}
