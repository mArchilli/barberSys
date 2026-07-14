import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Link } from '@inertiajs/react';

export default function CouponForm({ data, setData, errors, processing, plans, usedCount = 0, submitLabel, onSubmit, cancelHref }) {
    const selectedPlanIds = data.applicable_plan_ids ?? [];

    function togglePlan(planId) {
        if (selectedPlanIds.includes(planId)) {
            setData('applicable_plan_ids', selectedPlanIds.filter((id) => id !== planId));
        } else {
            setData('applicable_plan_ids', [...selectedPlanIds, planId]);
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
                <div>
                    <InputLabel htmlFor="code" value="Código *" />
                    <TextInput
                        id="code"
                        value={data.code}
                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                        className="mt-1 block w-full uppercase"
                        placeholder="Ej: BIENVENIDA20"
                        autoFocus
                    />
                    <InputError message={errors.code} className="mt-1" />
                </div>

                <div>
                    <InputLabel htmlFor="type" value="Tipo *" />
                    <select
                        id="type"
                        value={data.type}
                        onChange={(e) => setData('type', e.target.value)}
                        className="mt-1 block w-full rounded-brand-sm border-brand-border bg-brand-surface text-sm text-brand-text shadow-sm focus:border-brand-primary focus:ring-brand-primary"
                    >
                        <option value="percentage">Porcentaje (%)</option>
                        <option value="fixed">Monto fijo ($)</option>
                    </select>
                    <InputError message={errors.type} className="mt-1" />
                </div>
            </div>

            <div>
                <InputLabel htmlFor="value" value={data.type === 'percentage' ? 'Valor (%) *' : 'Valor ($) *'} />
                <TextInput
                    id="value"
                    type="number"
                    min="0"
                    step="0.01"
                    value={data.value}
                    onChange={(e) => setData('value', e.target.value)}
                    className="mt-1 block w-full sm:w-64"
                />
                <InputError message={errors.value} className="mt-1" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <div>
                    <InputLabel htmlFor="max_uses" value="Máx. usos" />
                    <TextInput
                        id="max_uses"
                        type="number"
                        min="1"
                        value={data.max_uses}
                        onChange={(e) => setData('max_uses', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="Ilimitado"
                    />
                    <InputError message={errors.max_uses} className="mt-1" />
                    {usedCount > 0 && (
                        <p className="mt-1 text-xs text-brand-text-secondary">
                            Ya usado {usedCount} {usedCount === 1 ? 'vez' : 'veces'}.
                        </p>
                    )}
                </div>

                <div>
                    <InputLabel htmlFor="duration_months" value="Duración (meses)" />
                    <TextInput
                        id="duration_months"
                        type="number"
                        min="1"
                        value={data.duration_months}
                        onChange={(e) => setData('duration_months', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="Indefinido"
                    />
                    <InputError message={errors.duration_months} className="mt-1" />
                </div>
            </div>

            <div>
                <InputLabel htmlFor="expires_at" value="Vencimiento" />
                <TextInput
                    id="expires_at"
                    type="date"
                    value={data.expires_at}
                    onChange={(e) => setData('expires_at', e.target.value)}
                    className="mt-1 block w-full sm:w-64"
                />
                <InputError message={errors.expires_at} className="mt-1" />
                <p className="mt-1 text-xs text-brand-text-secondary">
                    Dejalo vacío para que no venza nunca.
                </p>
            </div>

            <div className="border-t border-brand-border-subtle pt-6">
                <InputLabel value="Planes donde aplica" />
                <p className="mt-1 text-xs text-brand-text-secondary">
                    Sin seleccionar ninguno, el cupón aplica a todos los planes del catálogo.
                </p>
                <div className="mt-3 space-y-2">
                    {plans.map((plan) => (
                        <label key={plan.id} className="flex cursor-pointer items-center gap-3">
                            <Checkbox
                                checked={selectedPlanIds.includes(plan.id)}
                                onChange={() => togglePlan(plan.id)}
                            />
                            <span className="text-sm text-brand-text">{plan.name}</span>
                        </label>
                    ))}
                </div>
                <InputError message={errors.applicable_plan_ids} className="mt-2" />
            </div>

            <label className="flex cursor-pointer items-center gap-3">
                <Checkbox checked={data.active} onChange={(e) => setData('active', e.target.checked)} />
                <span className="text-sm font-medium text-brand-text">Cupón activo</span>
            </label>

            <div className="flex flex-col gap-3 border-t border-brand-border-subtle pt-6 sm:flex-row sm:items-center sm:justify-end">
                <Link
                    href={cancelHref}
                    className="flex min-h-[44px] items-center justify-center text-sm text-brand-text-secondary hover:text-brand-text sm:min-h-0"
                >
                    Cancelar
                </Link>
                <PrimaryButton disabled={processing} className="w-full justify-center sm:w-auto">
                    {submitLabel}
                </PrimaryButton>
            </div>
        </form>
    );
}
