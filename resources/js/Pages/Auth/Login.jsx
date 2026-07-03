import AuthLabel from '@/Components/AuthLabel';
import AuthTextInput from '@/Components/AuthTextInput';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import PasswordInput from '@/Components/PasswordInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { IconArrowRight } from '@tabler/icons-react';

export default function Login({ status, canResetPassword }) {
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

    return (
        <GuestLayout>
            <Head title="Iniciar sesión" />

            <div className="mb-7 text-center">
                <h1 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-brand-text">
                    Bienvenido de nuevo
                </h1>
                <p className="mt-2 text-sm leading-6 text-brand-text-secondary">
                    Ingresá a tu cuenta para seguir controlando tu barbería.
                </p>
            </div>

            {status && (
                <div className="mb-6 rounded-brand-md border border-brand-success/20 bg-brand-success-soft px-4 py-3 text-sm font-medium text-brand-success">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <AuthLabel htmlFor="email" value="Email" />
                    <AuthTextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        autoComplete="username"
                        isFocused={true}
                        error={!!errors.email}
                        placeholder="tu@email.com"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div>
                    <AuthLabel htmlFor="password" value="Contraseña" />
                    <PasswordInput
                        id="password"
                        name="password"
                        value={data.password}
                        autoComplete="current-password"
                        error={!!errors.password}
                        placeholder="••••••••"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div className="flex items-center justify-between pt-1">
                    <label className="flex cursor-pointer items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ms-2 text-sm text-brand-text-secondary">
                            Recordarme
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-semibold text-brand-primary hover:text-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-brand-pill bg-brand-primary px-6 text-sm font-bold text-brand-surface shadow-brand-cta transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 motion-reduce:transition-none motion-reduce:hover:transform-none"
                >
                    <span>{processing ? 'Ingresando…' : 'Iniciar sesión'}</span>
                    <IconArrowRight className="h-4 w-4" stroke={2.4} />
                </button>

                <p className="pt-2 text-center text-sm text-brand-text-secondary">
                    ¿No tenés cuenta?{' '}
                    <Link
                        href={route('register')}
                        className="font-semibold text-brand-primary hover:text-brand-primary-hover"
                    >
                        Creá una gratis
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
