import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ canAdd }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        address: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('owner.barberias.store'));
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-text">
                    Nueva barbería
                </h2>
            }
        >
            <Head title="Nueva barbería" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-brand-lg border border-brand-border bg-brand-surface shadow-brand-card">
                        <div className="p-8">
                            {! canAdd && (
                                <div className="mb-6 rounded-brand-md border border-brand-danger/30 bg-brand-danger-soft p-4 text-sm text-brand-danger">
                                    Alcanzaste el límite de barberías de tu plan. Actualizá tu plan para agregar más.
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-6">
                                {errors.plan_limit && (
                                    <div className="rounded-brand-md border border-brand-danger/30 bg-brand-danger-soft p-4 text-sm text-brand-danger">
                                        {errors.plan_limit}
                                    </div>
                                )}

                                <div>
                                    <InputLabel htmlFor="name" value="Nombre de la barbería *" />
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
                                    <InputLabel htmlFor="address" value="Dirección" />
                                    <TextInput
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="Opcional"
                                    />
                                    <InputError message={errors.address} className="mt-1" />
                                </div>

                                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
                                    <Link
                                        href={route('owner.barberias.index')}
                                        className="flex min-h-[44px] items-center justify-center text-sm text-brand-text-secondary hover:text-brand-text sm:min-h-0"
                                    >
                                        Cancelar
                                    </Link>
                                    <PrimaryButton disabled={processing || ! canAdd} className="w-full sm:w-auto">
                                        Crear barbería
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
