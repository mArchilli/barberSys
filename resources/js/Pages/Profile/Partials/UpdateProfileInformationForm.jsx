import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { IconCheck } from '@tabler/icons-react';

function InfoBlock({ children }) {
    return (
        <div className="rounded-[22px] bg-brand-surface-alt p-5">
            {children}
        </div>
    );
}

export default function UpdateProfileInformation({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit = (event) => {
        event.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section>
            <header>
                <h2 className="font-display text-xl font-bold text-brand-text">
                    Informacion del perfil
                </h2>
                <p className="mt-2 text-sm text-brand-text-secondary">
                    Actualiza tu nombre y el email principal que usas para ingresar al panel.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <InfoBlock>
                    <InputLabel htmlFor="name" value="Nombre" />
                    <TextInput
                        id="name"
                        className="mt-2 block w-full rounded-full border-brand-border bg-brand-surface px-4 py-3.5"
                        value={data.name}
                        onChange={(event) => setData('name', event.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </InfoBlock>

                <InfoBlock>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-2 block w-full rounded-full border-brand-border bg-brand-surface px-4 py-3.5"
                        value={data.email}
                        onChange={(event) => setData('email', event.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </InfoBlock>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-[22px] border border-dashed border-brand-border bg-brand-surface-alt p-5">
                        <p className="text-sm text-brand-text">
                            Tu direccion de email todavia no esta verificada.{' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="font-semibold text-brand-link underline hover:text-brand-link-hover"
                            >
                                Reenviar email de verificacion
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <p className="mt-3 text-sm font-medium text-brand-success">
                                Te enviamos un nuevo link de verificacion a tu email.
                            </p>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-brand-primary px-6 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                        Guardar cambios
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
                            Cambios guardados
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
