import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function ChangePassword() {
    const { data, setData, post, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('password.change.update'));
    }

    return (
        <GuestLayout>
            <Head title="Cambiá tu contraseña" />

            <div className="mb-6 text-sm text-brand-text-secondary">
                Por seguridad, necesitás establecer una nueva contraseña antes de continuar.
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="password" value="Nueva contraseña *" />
                    <TextInput
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className="mt-1 block w-full"
                        autoFocus
                        autoComplete="new-password"
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirmá la contraseña *" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                    />
                    <InputError message={errors.password_confirmation} className="mt-1" />
                </div>

                <div className="flex justify-end pt-1">
                    <PrimaryButton disabled={processing}>
                        Guardar contraseña
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
