import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ barberias, selectedBarberiaId }) {
    const { data, setData, post, processing, errors } = useForm({
        barberia_id: selectedBarberiaId ? String(selectedBarberiaId) : (barberias.length === 1 ? String(barberias[0].id) : ''),
        name: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('owner.medios-pago.store'));
    }

    const indexHref = barberias.length > 1 && data.barberia_id
        ? route('owner.medios-pago.index', { barberia_id: data.barberia_id })
        : route('owner.medios-pago.index');

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-text">
                    Nuevo medio de pago
                </h2>
            }
        >
            <Head title="Nuevo medio de pago" />

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
                                            <option value="">Seleccioná una barbería</option>
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
                                        placeholder="Ej: Efectivo, Transferencia, Tarjeta de débito"
                                    />
                                    <InputError message={errors.name} className="mt-1" />
                                </div>

                                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
                                    <Link
                                        href={indexHref}
                                        className="flex min-h-[44px] items-center justify-center text-sm text-brand-text-secondary hover:text-brand-text sm:min-h-0"
                                    >
                                        Cancelar
                                    </Link>
                                    <PrimaryButton disabled={processing} className="w-full sm:w-auto">
                                        Crear medio de pago
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
