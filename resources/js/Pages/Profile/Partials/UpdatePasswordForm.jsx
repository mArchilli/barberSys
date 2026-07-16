import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PasswordInput from '@/Components/PasswordInput';
import PasswordRequirements, { PASSWORD_REGEX } from '@/Components/PasswordRequirements';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { IconCheck } from '@tabler/icons-react';
import { useRef } from 'react';

function PasswordBlock({ children }) {
    return (
        <div className="rounded-[22px] bg-brand-surface-alt p-5">
            {children}
        </div>
    );
}

export default function UpdatePasswordForm() {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (event) => {
        event.preventDefault();

        if (!PASSWORD_REGEX.test(data.password)) return;

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (formErrors) => {
                if (formErrors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (formErrors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section>
            <header>
                <h2 className="font-display text-xl font-bold text-brand-text">
                    Cambiar contrasena
                </h2>
                <p className="mt-2 text-sm text-brand-text-secondary">
                    Usa una contrasena larga y segura para proteger tu acceso al sistema.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <PasswordBlock>
                    <InputLabel htmlFor="current_password" value="Contrasena actual" />
                    <PasswordInput
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(event) => setData('current_password', event.target.value)}
                        autoComplete="current-password"
                        error={!!errors.current_password}
                        className="mt-2 rounded-full border-brand-border bg-brand-surface px-4 py-3.5"
                    />
                    <InputError message={errors.current_password} className="mt-2" />
                </PasswordBlock>

                <PasswordBlock>
                    <InputLabel htmlFor="password" value="Nueva contrasena" />
                    <PasswordInput
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(event) => setData('password', event.target.value)}
                        autoComplete="new-password"
                        error={!!errors.password}
                        className="mt-2 rounded-full border-brand-border bg-brand-surface px-4 py-3.5"
                    />
                    <PasswordRequirements password={data.password} />
                    <InputError message={errors.password} className="mt-2" />
                </PasswordBlock>

                <PasswordBlock>
                    <InputLabel htmlFor="password_confirmation" value="Confirmar contrasena" />
                    <PasswordInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(event) => setData('password_confirmation', event.target.value)}
                        autoComplete="new-password"
                        error={!!errors.password_confirmation}
                        className="mt-2 rounded-full border-brand-border bg-brand-surface px-4 py-3.5"
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </PasswordBlock>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-brand-primary px-6 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                        Guardar contrasena
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="flex items-center gap-1 text-sm font-medium text-brand-success">
                            <IconCheck size={16} stroke={2.5} />
                            Contrasena actualizada
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
