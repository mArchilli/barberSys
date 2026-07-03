import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Create() {
    const { currentBarberia } = usePage().props;
    const barbId = currentBarberia?.id;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        price: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('owner.barberias.servicios.store', { barberia: barbId }));
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-text">
                    Nuevo servicio
                </h2>
            }
        >
            <Head title="Nuevo servicio" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-brand-card">
                        <div className="p-8">
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Nombre del servicio *" />
                                    <TextInput
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full"
                                        autoFocus
                                        placeholder="Ej: Corte de cabello"
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
                                        placeholder="0.00"
                                    />
                                    <InputError message={errors.price} className="mt-1" />
                                </div>

                                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
                                    <Link
                                        href={route('owner.barberias.servicios.index', { barberia: barbId })}
                                        className="flex min-h-[44px] items-center justify-center text-sm text-brand-text-secondary hover:text-brand-text sm:min-h-0"
                                    >
                                        Cancelar
                                    </Link>
                                    <PrimaryButton disabled={processing} className="w-full sm:w-auto">
                                        Crear servicio
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
