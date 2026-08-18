import AuthLabel from '@/Components/AuthLabel';
import AuthTextInput from '@/Components/AuthTextInput';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import PasswordInput from '@/Components/PasswordInput';
import WhatsAppButton from '@/Components/WhatsAppButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { IconArrowRight } from '@tabler/icons-react';

export default function Login({
    status,
    canResetPassword,
    whatsappSalesNumber,
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };
    const whatsappHref =
        `https://wa.me/${whatsappSalesNumber ?? ''}?text=` +
        encodeURIComponent(
            'Hola Estilus, necesito ayuda para ingresar a mi cuenta.',
        );

    return (
        <>
            <GuestLayout organicBackground maxWidth="sm:max-w-[30rem]">
                <Head title="Iniciar sesión" />

                <div className="mb-8 text-center">
                    <h1 className="font-display text-4xl font-extrabold tracking-[-0.03em] text-brand-text sm:text-[2.625rem]">
                        Bienvenido de nuevo
                    </h1>
                    <p className="mt-3 text-base leading-7 text-brand-text-secondary">
                        Ingresá a tu cuenta y mantené todo en orden.
                    </p>
                </div>

                {status && (
                    <div className="mb-6 rounded-brand-md border border-brand-success/20 bg-brand-success-soft px-5 py-3 text-base font-medium text-brand-success">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <AuthLabel
                            htmlFor="email"
                            value="Email"
                            className="mb-2 font-display text-base"
                        />
                        <AuthTextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            autoComplete="username"
                            isFocused={true}
                            error={!!errors.email}
                            placeholder="tu@email.com"
                            className="min-h-[52px] px-5 py-3 text-base"
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                        <AuthLabel
                            htmlFor="password"
                            value="Contraseña"
                            className="mb-2 font-display text-base"
                        />
                        <PasswordInput
                            id="password"
                            name="password"
                            value={data.password}
                            autoComplete="current-password"
                            error={!!errors.password}
                            placeholder="••••••••"
                            className="min-h-[52px] px-5 py-3 pr-12 text-base"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <label className="flex cursor-pointer items-center">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                className="h-5 w-5"
                                onChange={(e) =>
                                    setData('remember', e.target.checked)
                                }
                            />
                            <span className="ms-3 text-base text-brand-text-secondary">
                                Recordarme
                            </span>
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-base font-semibold text-brand-link hover:text-brand-link-hover focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-brand-pill bg-brand-nav-bg px-7 text-base font-bold text-brand-text-on-dark shadow-brand-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-text focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 motion-reduce:transition-none motion-reduce:hover:transform-none"
                    >
                        <span>
                            {processing ? 'Ingresando…' : 'Iniciar sesión'}
                        </span>
                        <IconArrowRight className="h-5 w-5" stroke={2.4} />
                    </button>

                    <p className="pt-2 text-center text-base text-brand-text-secondary">
                        ¿No tenés cuenta?{' '}
                        <Link
                            href={route('register')}
                            className="pricing-wavy-underline login-wavy-underline font-semibold text-brand-link hover:text-brand-link-hover"
                        >
                            Creá una gratis
                        </Link>
                    </p>
                </form>
            </GuestLayout>
            <WhatsAppButton
                href={whatsappHref}
                label="Consultar por WhatsApp sobre el inicio de sesión"
            />
        </>
    );
}
