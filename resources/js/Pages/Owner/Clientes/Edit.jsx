import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Edit({ cliente }) {
    const { currentBarberia } = usePage().props;
    const barbId = currentBarberia?.id;

    const { data, setData, patch, processing, errors } = useForm({
        name: cliente.name,
        phone: cliente.phone ?? '',
        email: cliente.email ?? '',
        active: cliente.active,
    });

    function submit(e) {
        e.preventDefault();
        patch(route('owner.barberias.clientes.update', { barberia: barbId, cliente: cliente.id }));
    }

    return (
        <AuthenticatedLayout
            header={(
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold leading-tight text-brand-text">
                        Editar cliente
                    </h2>
                </div>
            )}
        >
            <Head title="Editar cliente" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-brand-card">
                        <div className="p-8">
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Nombre *" />
                                    <TextInput
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full"
                                        autoFocus
                                    />
                                    <InputError message={errors.name} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="phone" value="Teléfono (opcional)" />
                                    <TextInput
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="mt-1 block w-full"
                                        autoComplete="tel"
                                    />
                                    <InputError message={errors.phone} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="email" value="Email (opcional)" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="mt-1 block w-full"
                                        autoComplete="email"
                                        inputMode="email"
                                    />
                                    <InputError message={errors.email} className="mt-1" />
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        id="active"
                                        type="checkbox"
                                        checked={data.active}
                                        onChange={(e) => setData('active', e.target.checked)}
                                        className="h-4 w-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                                    />
                                    <label htmlFor="active" className="cursor-pointer text-sm font-medium text-brand-text">
                                        Cliente activo
                                    </label>
                                </div>

                                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
                                    <Link
                                        href={route('owner.barberias.clientes.index', { barberia: barbId })}
                                        className="flex min-h-[44px] items-center justify-center text-sm text-brand-text-secondary hover:text-brand-text sm:min-h-0"
                                    >
                                        Cancelar
                                    </Link>
                                    <PrimaryButton disabled={processing} className="w-full sm:w-auto">
                                        Guardar cambios
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
