import AuthLabel from '@/Components/AuthLabel';
import AuthTextInput from '@/Components/AuthTextInput';
import InputError from '@/Components/InputError';
import PasswordInput from '@/Components/PasswordInput';
import PasswordRequirements, {
    PASSWORD_REGEX,
} from '@/Components/PasswordRequirements';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { IconArrowLeft, IconArrowRight, IconCheck } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

const STEPS = ['Tus datos', 'Tu plan', 'Tu barbería'];

const primaryButtonClass =
    'inline-flex min-h-[46px] items-center justify-center gap-2 rounded-brand-pill bg-brand-primary px-6 text-sm font-bold text-brand-surface shadow-brand-cta transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 motion-reduce:transition-none motion-reduce:hover:transform-none';

const secondaryButtonClass =
    'inline-flex min-h-[46px] items-center justify-center gap-2 rounded-brand-pill border border-brand-border bg-brand-surface px-6 text-sm font-bold text-brand-text transition-colors duration-200 hover:border-brand-primary-muted hover:bg-brand-surface-alt focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 motion-reduce:transition-none';

function StepIndicator({ step }) {
    return (
        <div className="mb-8 flex items-center">
            {STEPS.map((label, index) => {
                const num = index + 1;
                const isActive = step === num;
                const isDone = step > num;

                return (
                    <div key={label} className="flex flex-1 items-center last:flex-none">
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors duration-200 ${
                                    isActive
                                        ? 'bg-brand-primary text-brand-surface shadow-brand-cta'
                                        : isDone
                                          ? 'bg-brand-primary-soft text-brand-primary-soft-text'
                                          : 'bg-brand-surface-alt text-brand-text-secondary'
                                }`}
                            >
                                {isDone ? (
                                    <IconCheck className="h-4 w-4" stroke={2.6} />
                                ) : (
                                    num
                                )}
                            </div>
                            <span
                                className={`hidden text-xs font-semibold sm:block ${
                                    isActive ? 'text-brand-text' : 'text-brand-text-secondary'
                                }`}
                            >
                                {label}
                            </span>
                        </div>

                        {num !== STEPS.length && (
                            <div
                                className={`mx-2 h-0.5 flex-1 rounded-full transition-colors duration-200 ${
                                    isDone ? 'bg-brand-primary' : 'bg-brand-border-subtle'
                                }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default function Register({ plans }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        plan_id: plans?.[0]?.id ?? '',
        barberia_name: '',
    });

    const [step, setStep] = useState(1);
    const [stepErrors, setStepErrors] = useState({});

    useEffect(() => {
        if (errors.name || errors.email || errors.password || errors.password_confirmation) {
            setStep(1);
        } else if (errors.plan_id) {
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

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout maxWidth="sm:max-w-xl">
            <Head title="Crear cuenta" />

            <div className="mb-6 text-center">
                <h1 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-brand-text">
                    Creá tu cuenta en Pelito
                </h1>
                <p className="mt-2 text-sm leading-6 text-brand-text-secondary">
                    Ordená tu barbería en minutos. Empezás con 14 días de prueba gratis.
                </p>
            </div>

            <StepIndicator step={step} />

            <form
                onSubmit={submit}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && step < 3) e.preventDefault();
                }}
            >
                {step === 1 && (
                    <div className="space-y-4">
                        <div>
                            <AuthLabel htmlFor="name" value="Nombre" />
                            <AuthTextInput
                                id="name"
                                name="name"
                                value={data.name}
                                autoComplete="name"
                                isFocused={true}
                                error={!!errorFor('name')}
                                placeholder="Tu nombre completo"
                                onChange={(e) => setField('name', e.target.value)}
                            />
                            <InputError message={errorFor('name')} className="mt-1.5" />
                        </div>

                        <div>
                            <AuthLabel htmlFor="email" value="Email" />
                            <AuthTextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                autoComplete="username"
                                error={!!errorFor('email')}
                                placeholder="tu@email.com"
                                onChange={(e) => setField('email', e.target.value)}
                            />
                            <InputError message={errorFor('email')} className="mt-1.5" />
                        </div>

                        <div>
                            <AuthLabel htmlFor="password" value="Contraseña" />
                            <PasswordInput
                                id="password"
                                name="password"
                                value={data.password}
                                autoComplete="new-password"
                                error={!!errorFor('password')}
                                placeholder="••••••••"
                                onChange={(e) => setField('password', e.target.value)}
                            />
                            <PasswordRequirements password={data.password} />
                            <InputError message={errorFor('password')} className="mt-1.5" />
                        </div>

                        <div>
                            <AuthLabel
                                htmlFor="password_confirmation"
                                value="Confirmar contraseña"
                            />
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                autoComplete="new-password"
                                error={!!errorFor('password_confirmation')}
                                placeholder="••••••••"
                                onChange={(e) =>
                                    setField('password_confirmation', e.target.value)
                                }
                            />
                            <InputError
                                message={errorFor('password_confirmation')}
                                className="mt-1.5"
                            />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {plans.map((plan) => {
                                const selected = data.plan_id === plan.id;
                                return (
                                    <label
                                        key={plan.id}
                                        className={`relative flex cursor-pointer flex-col rounded-brand-lg border-2 p-5 text-left transition-all duration-150 ${
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
                                            <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-brand-surface">
                                                <IconCheck className="h-3 w-3" stroke={3} />
                                            </span>
                                        )}
                                        <span className="text-sm font-bold text-brand-text">
                                            {plan.name}
                                        </span>
                                        <span className="mt-3 font-display text-2xl font-extrabold tracking-[-0.04em] text-brand-text">
                                            {formatPrice(plan)}
                                            {!plan.is_custom && (
                                                <span className="ml-1 text-sm font-medium text-brand-text-secondary">
                                                    /mes
                                                </span>
                                            )}
                                        </span>
                                        <span className="mt-3 text-xs leading-5 text-brand-text-secondary">
                                            {formatLimit(plan.max_barberias)} barbería
                                            {plan.max_barberias !== 1 ? 's' : ''} ·{' '}
                                            {formatLimit(plan.max_barberos)} barbero
                                            {plan.max_barberos !== 1 ? 's' : ''}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                        <InputError message={errorFor('plan_id')} className="mt-3" />
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                        <div>
                            <AuthLabel htmlFor="barberia_name" value="Nombre de tu barbería" />
                            <AuthTextInput
                                id="barberia_name"
                                name="barberia_name"
                                value={data.barberia_name}
                                isFocused={true}
                                error={!!errorFor('barberia_name')}
                                placeholder="Ej: Barbería Central"
                                onChange={(e) => setField('barberia_name', e.target.value)}
                            />
                            <InputError message={errorFor('barberia_name')} className="mt-1.5" />
                        </div>
                    </div>
                )}

                <div className="mt-8 flex items-center justify-between gap-3">
                    {step > 1 ? (
                        <button type="button" onClick={goBack} className={secondaryButtonClass}>
                            <IconArrowLeft className="h-4 w-4" stroke={2.4} />
                            <span>Anterior</span>
                        </button>
                    ) : (
                        <Link
                            href={route('login')}
                            className="text-sm text-brand-text-secondary underline hover:text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
                        >
                            ¿Ya tenés cuenta?
                        </Link>
                    )}

                    {step < 3 ? (
                        <button type="button" onClick={goNext} className={primaryButtonClass}>
                            <span>Siguiente</span>
                            <IconArrowRight className="h-4 w-4" stroke={2.4} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={submit}
                            disabled={processing}
                            className={primaryButtonClass}
                        >
                            <span>{processing ? 'Creando cuenta…' : 'Crear cuenta'}</span>
                            <IconArrowRight className="h-4 w-4" stroke={2.4} />
                        </button>
                    )}
                </div>
            </form>
        </GuestLayout>
    );
}
