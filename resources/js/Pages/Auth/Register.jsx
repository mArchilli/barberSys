import AuthLabel from '@/Components/AuthLabel';
import AuthTextInput from '@/Components/AuthTextInput';
import InputError from '@/Components/InputError';
import PasswordInput from '@/Components/PasswordInput';
import PasswordRequirements, {
    PASSWORD_REGEX,
} from '@/Components/PasswordRequirements';
import WhatsAppButton from '@/Components/WhatsAppButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { IconArrowLeft, IconArrowRight, IconCheck, IconX } from '@tabler/icons-react';
import axios from 'axios';
import { useEffect, useState } from 'react';

const STEPS = ['Tus datos', 'Tu plan', 'Tu barbería'];

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

const DESKTOP_STEP_ARROWS = [
    'M215 102 C258 101 275 122 302 145 C329 167 362 151 392 174 C410 188 418 200 425 215',
    'M440 320 C442 341 445 350 430 364 C418 376 429 388 427 400 C425 413 433 425 440 438',
];

const MOBILE_STEP_ARROWS = [
    'M80 45 C101 25 122 62 140 45',
    'M220 45 C240 63 260 26 280 45',
];

function StepArrowField({ step, compact = false }) {
    const markerId = compact
        ? 'register-step-arrow-mobile'
        : 'register-step-arrow-desktop';
    const activeMarkerId = `${markerId}-active`;
    const mutedMarkerId = `${markerId}-muted`;
    const paths = compact ? MOBILE_STEP_ARROWS : DESKTOP_STEP_ARROWS;
    const viewBox = compact ? '0 0 360 96' : '0 0 520 560';

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

            {paths.slice(0, Math.min(step, paths.length)).map((path, index) => {
                const isReached = step > index + 1;

                return (
                    <path
                        key={path}
                        d={path}
                        pathLength="1"
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

function StepNode({ node, number, step, compact = false }) {
    const isActive = step === number;
    const isDone = step > number;

    return (
        <li
            aria-current={isActive ? 'step' : undefined}
            className={`absolute z-20 flex flex-col items-center justify-center border-2 text-center transition-all duration-300 ${
                compact
                    ? `h-[4.5rem] w-20 px-2 ${node.mobilePosition}`
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
            <span
                className={`font-display font-extrabold leading-none ${
                    compact ? 'text-2xl' : 'text-4xl'
                }`}
            >
                {number}
            </span>
            <span
                className={`mt-1 font-semibold leading-tight ${
                    compact ? 'text-[0.625rem]' : 'text-sm'
                }`}
            >
                {node.label}
            </span>
        </li>
    );
}

function StepIndicator({ step }) {
    return (
        <aside
            aria-label="Progreso del registro"
            className="relative mb-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mb-0 lg:min-h-[35rem] lg:translate-x-6 lg:self-stretch xl:translate-x-10 2xl:translate-x-14"
        >
            <div className="relative h-24 w-full lg:hidden">
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

            <div className="relative hidden h-full min-h-[35rem] w-full lg:block">
                <StepArrowField step={step} />
                <ol className="absolute inset-0">
                    {STEP_NODES.map((node, index) => (
                        <StepNode
                            key={`desktop-${node.label}`}
                            node={node}
                            number={index + 1}
                            step={step}
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

    const formatLimit = (value) => (value === null ? 'Ilimitado' : value);

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
            <GuestLayout registerBackground maxWidth="sm:max-w-[1440px]">
                <Head title="Crear cuenta" />

                <div className="mx-auto grid w-full max-w-[30rem] lg:max-w-none lg:grid-cols-[minmax(0,30rem)_minmax(16rem,1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-20 xl:gap-x-32">
                    <div className="mb-8 text-center lg:col-start-1 lg:row-start-1">
                        <h1 className="font-display text-4xl font-extrabold tracking-[-0.03em] text-brand-text sm:text-[2.625rem]">
                            Creá tu cuenta en Estilus Barber
                        </h1>
                        <p className="mt-3 text-base leading-7 text-brand-text-secondary">
                            ¿Todavía dudás? Tenés 14 días de prueba gratis.
                        </p>
                    </div>

                    <StepIndicator step={step} />

                    <form
                        onSubmit={submit}
                        className="lg:col-start-1 lg:row-start-2"
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
                            <PasswordRequirements password={data.password} />
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
                    <div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {plans.map((plan) => {
                                const selected = data.plan_id === plan.id;
                                return (
                                    <label
                                        key={plan.id}
                                        className={`relative flex cursor-pointer flex-col rounded-brand-lg border-2 p-6 text-left transition-all duration-150 ${
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
                                            <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-brand-on-primary">
                                                <IconCheck className="h-3 w-3" stroke={3} />
                                            </span>
                                        )}
                                        <span className="text-base font-bold text-brand-text">
                                            {plan.name}
                                        </span>
                                        <span className="mt-3 font-display text-3xl font-extrabold tracking-[-0.04em] text-brand-text">
                                            {formatPrice(plan)}
                                            {!plan.is_custom && (
                                                <span className="ml-1 text-base font-medium text-brand-text-secondary">
                                                    /mes
                                                </span>
                                            )}
                                        </span>
                                        <span className="mt-3 text-sm leading-6 text-brand-text-secondary">
                                            {formatLimit(plan.max_barberias)} barbería
                                            {plan.max_barberias !== 1 ? 's' : ''} ·{' '}
                                            {formatLimit(plan.max_barberos)} barbero
                                            {plan.max_barberos !== 1 ? 's' : ''}
                                        </span>

                                        {plan.included_items?.length > 0 && (
                                            <ul className="mt-3 space-y-1 border-t border-brand-border-subtle pt-3">
                                                {plan.included_items.map((item, i) => (
                                                    <li
                                                        key={i}
                                                        className="flex items-start gap-2 text-sm leading-6 text-brand-text-secondary"
                                                    >
                                                        <IconCheck
                                                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-primary"
                                                            stroke={2.6}
                                                        />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                        <InputError message={errorFor('plan_id')} className="mt-3" />

                        <div className="mt-8">
                            <AuthLabel
                                htmlFor="coupon_code"
                                value="Código de cupón (opcional)"
                                className={authLabelClass}
                            />
                            <AuthTextInput
                                id="coupon_code"
                                name="coupon_code"
                                value={data.coupon_code}
                                error={couponStatus === 'invalid'}
                                placeholder="Ej: BIENVENIDA20"
                                className={authInputClass}
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

                <div className="mt-10 flex items-center justify-between gap-4">
                    {step > 1 ? (
                        <button type="button" onClick={goBack} className={secondaryButtonClass}>
                            <IconArrowLeft className="h-5 w-5" stroke={2.4} />
                            <span>Anterior</span>
                        </button>
                    ) : (
                        <Link
                            href={route('login')}
                            className="text-base font-semibold text-brand-link underline hover:text-brand-link-hover focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
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
