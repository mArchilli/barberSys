import AuthLabel from '@/Components/AuthLabel';
import AuthTextInput from '@/Components/AuthTextInput';
import InputError from '@/Components/InputError';
import PasswordInput from '@/Components/PasswordInput';
import PasswordRequirements, {
    PASSWORD_REGEX,
} from '@/Components/PasswordRequirements';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

const primaryButtonClass =
    'inline-flex min-h-[46px] items-center justify-center gap-2 rounded-brand-pill bg-brand-primary px-6 text-sm font-bold text-brand-on-primary shadow-brand-cta transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 motion-reduce:transition-none motion-reduce:hover:transform-none';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (!PASSWORD_REGEX.test(data.password)) return;

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Restablecer contraseña" />

            <div className="mb-6 text-center">
                <h1 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-brand-text">
                    Restablecé tu contraseña
                </h1>
                <p className="mt-2 text-sm leading-6 text-brand-text-secondary">
                    Elegí una nueva contraseña para tu cuenta.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <AuthLabel htmlFor="email" value="Email" />
                    <AuthTextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        autoComplete="username"
                        error={!!errors.email}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div>
                    <AuthLabel htmlFor="password" value="Nueva contraseña" />
                    <PasswordInput
                        id="password"
                        name="password"
                        value={data.password}
                        autoComplete="new-password"
                        error={!!errors.password}
                        placeholder="••••••••"
                        autoFocus
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <PasswordRequirements password={data.password} />
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div>
                    <AuthLabel
                        htmlFor="password_confirmation"
                        value="Confirmá la contraseña"
                    />
                    <PasswordInput
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        autoComplete="new-password"
                        error={!!errors.password_confirmation}
                        placeholder="••••••••"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                    />
                    <InputError
                        message={errors.password_confirmation}
                        className="mt-1.5"
                    />
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className={primaryButtonClass}
                    >
                        {processing ? 'Restableciendo…' : 'Restablecer contraseña'}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
