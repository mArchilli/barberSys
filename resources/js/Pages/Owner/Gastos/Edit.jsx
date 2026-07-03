import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Edit({ gasto }) {
    const { currentBarberia } = usePage().props;
    const barbId = currentBarberia?.id;

    const { data, setData, patch, processing, errors } = useForm({
        name: gasto.name,
        amount: String(gasto.amount),
        type: gasto.type,
        is_recurring: gasto.is_recurring,
        active: gasto.active,
    });

    function submit(e) {
        e.preventDefault();
        patch(route('owner.barberias.gastos.update', { barberia: barbId, gasto: gasto.id }));
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-text">
                    Editar gasto
                </h2>
            }
        >
            <Head title="Editar gasto" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-brand-card">
                        <div className="p-8">
                            <p className="mb-6 text-sm text-brand-text-secondary">
                                Estos cambios afectan la plantilla hacia adelante — no modifican los registros ya generados de meses anteriores ni del mes actual.
                            </p>

                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Nombre del gasto *" />
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
                                    <InputLabel htmlFor="amount" value="Monto ($) *" />
                                    <TextInput
                                        id="amount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.amount} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="type" value="Tipo *" />
                                    <select
                                        id="type"
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-brand-border shadow-sm focus:border-brand-primary focus:ring-brand-primary"
                                    >
                                        <option value="fijo">Fijo</option>
                                        <option value="variable">Variable</option>
                                    </select>
                                    <InputError message={errors.type} className="mt-1" />
                                </div>

                                <div className="flex items-start gap-3">
                                    <input
                                        id="is_recurring"
                                        type="checkbox"
                                        checked={data.is_recurring}
                                        onChange={(e) => setData('is_recurring', e.target.checked)}
                                        className="mt-0.5 h-4 w-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                                    />
                                    <label htmlFor="is_recurring" className="cursor-pointer text-sm">
                                        <span className="font-medium text-brand-text">Es recurrente</span>
                                        <p className="text-brand-text-secondary">Se va a generar automáticamente cada mes hasta que lo des de baja.</p>
                                    </label>
                                </div>
                                <InputError message={errors.is_recurring} className="mt-1" />

                                <div className="flex items-center gap-3">
                                    <input
                                        id="active"
                                        type="checkbox"
                                        checked={data.active}
                                        onChange={(e) => setData('active', e.target.checked)}
                                        className="h-4 w-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                                    />
                                    <label htmlFor="active" className="cursor-pointer text-sm font-medium text-brand-text">
                                        Gasto activo
                                    </label>
                                </div>

                                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
                                    <Link
                                        href={route('owner.barberias.finanzas', { barberia: barbId })}
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
