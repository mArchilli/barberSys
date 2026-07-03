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

    const deleteUser = (e) => {
        e.preventDefault();

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
        <section className="space-y-4">
            <header className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-danger-soft text-brand-danger">
                    <IconAlertTriangle size={20} stroke={1.75} />
                </span>
                <div>
                    <h2 className="font-display text-lg font-bold text-brand-text">
                        Eliminar cuenta
                    </h2>

                    <p className="mt-1 text-sm text-brand-text-secondary">
                        Al eliminar tu cuenta se borran para siempre todos tus datos y
                        recursos asociados. Descargá cualquier información que quieras
                        conservar antes de continuar.
                    </p>
                </div>
            </header>

            <DangerButton onClick={confirmUserDeletion}>
                Eliminar cuenta
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <h2 className="font-display text-lg font-bold text-brand-text">
                        ¿Estás seguro de que querés eliminar tu cuenta?
                    </h2>

                    <p className="mt-1 text-sm text-brand-text-secondary">
                        Esta acción no se puede deshacer. Todos tus datos y recursos se
                        van a borrar de forma permanente. Ingresá tu contraseña para
                        confirmar que querés eliminar tu cuenta.
                    </p>

                    <div className="mt-6">
                        <InputLabel
                            htmlFor="password"
                            value="Contraseña"
                            className="sr-only"
                        />

                        <PasswordInput
                            id="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            error={!!errors.password}
                            placeholder="Contraseña"
                            autoFocus
                        />

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
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
