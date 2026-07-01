import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ servicio, barberias }) {
    const { data, setData, patch, processing, errors } = useForm({
        barberia_id: String(servicio.barberia_id),
        name: servicio.name,
        price: String(servicio.price),
        active: servicio.active,
    });

    function submit(e) {
        e.preventDefault();
        patch(route('owner.servicios.update', servicio.id));
    }

    const indexHref = barberias.length > 1
        ? route('owner.servicios.index', { barberia_id: servicio.barberia_id })
        : route('owner.servicios.index');

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-text">
                    Editar servicio
                </h2>
            }
        >
            <Head title="Editar servicio" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-card">
                        <div className="p-8">
                            <form onSubmit={submit} className="space-y-6">

                                {barberias.length > 1 && (
                                    <div>
                                        <InputLabel htmlFor="barberia_id" value="Barbería *" />
                                        <select
                                            id="barberia_id"
                                            value={data.barberia_id}
                                            onChange={(e) => setData('barberia_id', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-brand-border py-2.5 shadow-sm focus:border-brand-primary focus:ring-brand-primary"
                                        >
                                            {barberias.map((b) => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.barberia_id} className="mt-1" />
                                    </div>
                                )}

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
                                    <InputLabel htmlFor="price" value="Precio ($) *" />
                                    <TextInput
                                        id="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.price} className="mt-1" />
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="active"
                                        checked={data.active}
                                        onChange={(e) => setData('active', e.target.checked)}
                                        className="h-4 w-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                                    />
                                    <label htmlFor="active" className="cursor-pointer text-sm font-medium text-brand-text">
                                        Activo
                                    </label>
                                </div>

                                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
                                    <Link
                                        href={indexHref}
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
