import AuthLabel from '@/Components/AuthLabel';
import InputError from '@/Components/InputError';
import PasswordInput from '@/Components/PasswordInput';
import PasswordRequirements, {
    PASSWORD_REGEX,
} from '@/Components/PasswordRequirements';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

const primaryButtonClass =
    'inline-flex min-h-[46px] items-center justify-center gap-2 rounded-brand-pill bg-brand-primary px-6 text-sm font-bold text-brand-on-primary shadow-brand-cta transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 motion-reduce:transition-none motion-reduce:hover:transform-none';

export default function ChangePassword() {
    const { data, setData, post, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    function submit(e) {
        e.preventDefault();
        if (!PASSWORD_REGEX.test(data.password)) return;
        post(route('password.change.update'));
    }

    return (
        <GuestLayout>
            <Head title="Cambiá tu contraseña" />

            <div className="mb-6 text-center">
                <h1 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-brand-text">
                    Cambiá tu contraseña
                </h1>
                <p className="mt-2 text-sm leading-6 text-brand-text-secondary">
                    Por seguridad, necesitás establecer una nueva contraseña antes de
                    continuar.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
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
                        {processing ? 'Guardando…' : 'Guardar contraseña'}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
