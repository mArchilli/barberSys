import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Create({ canAdd }) {
    const { currentBarberia } = usePage().props;
    const barbId = currentBarberia?.id;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        salary_type: 'fixed',
        salary_amount: '',
        commission_pct: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('owner.barberias.barberos.store', { barberia: barbId }));
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-text">
                    Nuevo barbero
                </h2>
            }
        >
            <Head title="Nuevo barbero" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-card">
                        <div className="p-8">
                            {! canAdd && (
                                <div className="mb-6 rounded-lg border border-brand-danger/30 bg-brand-danger/10 p-4 text-sm text-brand-danger">
                                    Alcanzaste el límite de barberos de tu plan. Actualizá tu plan para agregar más.
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-6">
                                {errors.plan_limit && (
                                    <div className="rounded-lg border border-brand-danger/30 bg-brand-danger/10 p-4 text-sm text-brand-danger">
                                        {errors.plan_limit}
                                    </div>
                                )}

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

                                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
                                    <Link
                                        href={route('owner.barberias.barberos.index', { barberia: barbId })}
                                        className="flex min-h-[44px] items-center justify-center text-sm text-brand-text-secondary hover:text-brand-text sm:min-h-0"
                                    >
                                        Cancelar
                                    </Link>
                                    <PrimaryButton disabled={processing || ! canAdd} className="w-full sm:w-auto">
                                        Crear barbero
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
