import AuthLabel from '@/Components/AuthLabel';
import AuthTextInput from '@/Components/AuthTextInput';
import InputError from '@/Components/InputError';
import PasswordInput from '@/Components/PasswordInput';
import PasswordRequirements, {
    PASSWORD_REGEX,
} from '@/Components/PasswordRequirements';
import WaveTransition from '@/Components/WaveTransition';
import GuestLayout from '@/Layouts/GuestLayout';
import { PLAN_GUIDANCE } from '@/planGuidance';
import { Head, Link, useForm } from '@inertiajs/react';
import { IconArrowLeft, IconArrowRight, IconCheck, IconX } from '@tabler/icons-react';
import axios from 'axios';
import { useEffect, useState } from 'react';

const primaryButtonClass =
    'inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-brand-pill bg-brand-nav-bg px-7 text-base font-bold text-brand-text-on-dark shadow-brand-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-text focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none';

const secondaryButtonClass =
    'inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-brand-pill border border-brand-border bg-brand-surface px-7 text-base font-bold text-brand-text shadow-brand-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-primary-muted hover:bg-brand-surface-alt focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none';

const authLabelClass = 'mb-2 font-display text-base';
const authInputClass = 'min-h-[52px] px-5 py-3 text-base';
const passwordInputClass = 'min-h-[52px] px-5 py-3 pr-12 text-base';

const stepHeadings = {
    1: '¡Empecemos a crear tu barbería!',
    2: 'Elegí el plan que más se parezca a tu negocio.',
    3: '¿Cómo se llama tu barbería?',
};

export default function Register({ plans }) {
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
                        className={`mb-2 text-center lg:col-start-1 lg:row-start-1 lg:mb-8 ${
                            step === 2
                                ? 'lg:-translate-x-[clamp(0rem,calc(26.667vw-24rem),8rem)]'
                                : ''
                        }`}
                    >
                        <h1 className="font-display text-[2.625rem] font-extrabold leading-[0.98] tracking-[-0.035em] text-brand-text sm:text-5xl lg:text-[3.25rem]">
                            {stepHeadings[step]}
                        </h1>
                        {step === 1 && (
                            <p className="mt-3 text-base leading-7 text-brand-text-secondary">
                                ¿Todavía dudás? No te vamos a pedir ninguna
                                tarjeta al crear la cuenta y, además,{' '}
                                <span className="pricing-wavy-underline login-wavy-underline font-semibold">
                                    tenés 14 días de prueba gratis.
                                </span>
                            </p>
                        )}
                    </div>

                    <div className="relative left-1/2 w-screen -translate-x-1/2 lg:hidden">
                        <WaveTransition
                            fromClassName="text-white"
                            toClassName="bg-brand-primary"
                        />
                    </div>

                    <form
                        onSubmit={submit}
                        className={`relative isolate -mb-10 min-w-0 pb-10 pt-5 before:absolute before:-bottom-[100vh] before:left-1/2 before:top-0 before:-z-10 before:w-screen before:-translate-x-1/2 before:bg-brand-primary sm:-mb-14 sm:pb-14 lg:col-start-1 lg:row-start-2 lg:mb-0 lg:pb-0 lg:pt-0 lg:before:hidden ${
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
        </>
    );
}
