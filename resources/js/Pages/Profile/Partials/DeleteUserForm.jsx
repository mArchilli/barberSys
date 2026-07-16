import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PasswordInput from '@/Components/PasswordInput';
import SecondaryButton from '@/Components/SecondaryButton';
import { useForm } from '@inertiajs/react';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useRef, useState } from 'react';

export default function DeleteUserForm() {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (event) => {
        event.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className="space-y-5">
            <header className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-danger/10 text-brand-danger shadow-sm">
                    <IconAlertTriangle size={20} stroke={1.75} />
                </span>
                <div>
                    <h2 className="font-display text-xl font-bold text-brand-text">
                        Eliminar cuenta
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm text-brand-text-secondary">
                        Esta accion elimina para siempre tus datos y recursos asociados. Si necesitas conservar algo, revisalo antes de continuar.
                    </p>
                </div>
            </header>

            <div className="rounded-[22px] border border-brand-danger/20 bg-brand-danger/5 p-5">
                <p className="text-sm text-brand-danger">
                    Una vez confirmada, la eliminacion no se puede deshacer.
                </p>
            </div>

            <button
                type="button"
                onClick={confirmUserDeletion}
                className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-brand-danger px-6 text-sm font-semibold text-white shadow-brand-cta transition hover:opacity-90"
            >
                Eliminar cuenta
            </button>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <h2 className="font-display text-lg font-bold text-brand-text">
                        Confirmar eliminacion de cuenta
                    </h2>

                    <p className="mt-2 text-sm text-brand-text-secondary">
                        Esta accion no se puede deshacer. Ingresa tu contrasena para confirmar que quieres eliminar la cuenta de forma permanente.
                    </p>

                    <div className="mt-6">
                        <InputLabel htmlFor="password" value="Contrasena" className="sr-only" />
                        <PasswordInput
                            id="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(event) => setData('password', event.target.value)}
                            error={!!errors.password}
                            placeholder="Contrasena"
                            autoFocus
                            className="rounded-full border-brand-border bg-brand-surface px-4 py-3.5"
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal}>
                            Cancelar
                        </SecondaryButton>
                        <DangerButton disabled={processing}>
                            Eliminar cuenta
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
