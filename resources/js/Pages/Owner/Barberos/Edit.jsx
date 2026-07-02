import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Edit({ barbero }) {
    const { currentBarberia } = usePage().props;
    const barbId = currentBarberia?.id;

    const { data, setData, patch, processing, errors } = useForm({
        name: barbero.name,
        email: barbero.email,
        phone: barbero.phone ?? '',
        salary_type: barbero.salary_type,
        salary_amount: barbero.salary_amount ?? '',
        commission_pct: barbero.commission_pct ?? '',
        active: barbero.active,
    });

    function submit(e) {
        e.preventDefault();
        patch(route('owner.barberias.barberos.update', { barberia: barbId, barbero: barbero.id }));
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-text">
                    Editar barbero
                </h2>
            }
        >
            <Head title="Editar barbero" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-card">
                        <div className="p-8">
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Nombre completo *" />
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
                                    <InputLabel htmlFor="email" value="Email *" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.email} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="phone" value="Teléfono" />
                                    <TextInput
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="Opcional"
                                    />
                                    <InputError message={errors.phone} className="mt-1" />
                                </div>

                                <fieldset>
                                    <legend className="mb-2 block text-sm font-medium text-brand-text">
                                        Tipo de sueldo *
                                    </legend>
                                    <div className="flex gap-6">
                                        <label className="flex cursor-pointer items-center gap-2">
                                            <input
                                                type="radio"
                                                name="salary_type"
                                                value="fixed"
                                                checked={data.salary_type === 'fixed'}
                                                onChange={() => setData('salary_type', 'fixed')}
                                                className="text-brand-primary focus:ring-brand-primary"
                                            />
                                            <span className="text-sm text-brand-text">Sueldo fijo</span>
                                        </label>
                                        <label className="flex cursor-pointer items-center gap-2">
                                            <input
                                                type="radio"
                                                name="salary_type"
                                                value="commission"
                                                checked={data.salary_type === 'commission'}
                                                onChange={() => setData('salary_type', 'commission')}
                                                className="text-brand-primary focus:ring-brand-primary"
                                            />
                                            <span className="text-sm text-brand-text">Comisión</span>
                                        </label>
                                    </div>
                                    <InputError message={errors.salary_type} className="mt-1" />
                                </fieldset>

                                {data.salary_type === 'fixed' && (
                                    <div>
                                        <InputLabel htmlFor="salary_amount" value="Monto fijo mensual ($) *" />
                                        <TextInput
                                            id="salary_amount"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.salary_amount}
                                            onChange={(e) => setData('salary_amount', e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.salary_amount} className="mt-1" />
                                    </div>
                                )}

                                {data.salary_type === 'commission' && (
                                    <div>
                                        <InputLabel htmlFor="commission_pct" value="Porcentaje de comisión (%) *" />
                                        <TextInput
                                            id="commission_pct"
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={data.commission_pct}
                                            onChange={(e) => setData('commission_pct', e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.commission_pct} className="mt-1" />
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    <input
                                        id="active"
                                        type="checkbox"
                                        checked={data.active}
                                        onChange={(e) => setData('active', e.target.checked)}
                                        className="h-4 w-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                                    />
                                    <label htmlFor="active" className="cursor-pointer text-sm font-medium text-brand-text">
                                        Cuenta activa
                                    </label>
                                </div>

                                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
                                    <Link
                                        href={route('owner.barberias.barberos.index', { barberia: barbId })}
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
