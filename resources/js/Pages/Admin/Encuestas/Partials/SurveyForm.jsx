import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import SurveyQuestionBuilder from '@/Components/Admin/SurveyQuestionBuilder';
import { Link } from '@inertiajs/react';

export default function SurveyForm({ data, setData, errors, processing, submitLabel, onSubmit, cancelHref }) {
    const includesOwner = data.target_audience !== 'barber';

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div>
                <InputLabel htmlFor="title" value="Título *" />
                <TextInput
                    id="title"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    className="mt-1 block w-full"
                    autoFocus
                />
                <InputError message={errors.title} className="mt-1" />
            </div>

            <div>
                <InputLabel htmlFor="description" value="Descripción" />
                <textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-brand-sm border-brand-border bg-brand-surface text-sm text-brand-text shadow-sm focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
                />
                <InputError message={errors.description} className="mt-1" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <div>
                    <InputLabel htmlFor="target_audience" value="Audiencia *" />
                    <select
                        id="target_audience"
                        value={data.target_audience}
                        onChange={(e) => setData('target_audience', e.target.value)}
                        className="mt-1 block w-full rounded-brand-sm border-brand-border bg-brand-surface text-sm text-brand-text shadow-sm focus:border-brand-primary focus:ring-brand-primary"
                    >
                        <option value="owner">Solo owners</option>
                        <option value="barber">Solo barberos</option>
                        <option value="both">Owners y barberos</option>
                    </select>
                    <InputError message={errors.target_audience} className="mt-1" />
                </div>

                <label className="flex cursor-pointer items-center gap-3 sm:self-end sm:pb-2">
                    <Checkbox checked={data.active} onChange={(e) => setData('active', e.target.checked)} />
                    <span className="text-sm font-medium text-brand-text">Encuesta activa</span>
                </label>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <div>
                    <InputLabel htmlFor="starts_at" value="Inicio" />
                    <TextInput
                        id="starts_at"
                        type="date"
                        value={data.starts_at}
                        onChange={(e) => setData('starts_at', e.target.value)}
                        className="mt-1 block w-full"
                    />
                    <InputError message={errors.starts_at} className="mt-1" />
                    <p className="mt-1 text-xs text-brand-text-secondary">Vacío = disponible desde ya.</p>
                </div>

                <div>
                    <InputLabel htmlFor="ends_at" value="Fin" />
                    <TextInput
                        id="ends_at"
                        type="date"
                        value={data.ends_at}
                        onChange={(e) => setData('ends_at', e.target.value)}
                        className="mt-1 block w-full"
                    />
                    <InputError message={errors.ends_at} className="mt-1" />
                    <p className="mt-1 text-xs text-brand-text-secondary">Vacío = sin fecha de cierre.</p>
                </div>
            </div>

            <div className="border-t border-brand-border-subtle pt-6">
                <InputLabel htmlFor="reward_type" value="Premio" />
                <select
                    id="reward_type"
                    value={data.reward_type}
                    onChange={(e) => setData('reward_type', e.target.value)}
                    className="mt-1 block w-full rounded-brand-sm border-brand-border bg-brand-surface text-sm text-brand-text shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:w-64"
                >
                    <option value="none">Sin premio</option>
                    <option value="coupon">Cupón de descuento</option>
                </select>
                <InputError message={errors.reward_type} className="mt-1" />

                {/* El premio (cupón automático) aplica exclusivamente a owners —
                    ver regla en CLAUDE.md. Si la audiencia es solo barberos, ni
                    siquiera mostramos los campos: prometerían algo que nunca se
                    cumple. */}
                {!includesOwner && data.reward_type === 'coupon' && (
                    <p className="mt-2 text-xs text-brand-warning">
                        Esta encuesta apunta solo a barberos: el premio no tiene efecto porque los barberos no
                        tienen suscripción propia que descontar.
                    </p>
                )}

                {includesOwner && data.reward_type === 'coupon' && (
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        <div>
                            <InputLabel htmlFor="reward_coupon_type" value="Tipo de cupón *" />
                            <select
                                id="reward_coupon_type"
                                value={data.reward_coupon_type ?? 'percentage'}
                                onChange={(e) => setData('reward_coupon_type', e.target.value)}
                                className="mt-1 block w-full rounded-brand-sm border-brand-border bg-brand-surface text-sm text-brand-text shadow-sm focus:border-brand-primary focus:ring-brand-primary"
                            >
                                <option value="percentage">Porcentaje (%)</option>
                                <option value="fixed">Monto fijo ($)</option>
                            </select>
                            <InputError message={errors.reward_coupon_type} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="reward_coupon_value"
                                value={data.reward_coupon_type === 'fixed' ? 'Valor ($) *' : 'Valor (%) *'}
                            />
                            <TextInput
                                id="reward_coupon_value"
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.reward_coupon_value}
                                onChange={(e) => setData('reward_coupon_value', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.reward_coupon_value} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="reward_coupon_duration_months" value="Duración (meses)" />
                            <TextInput
                                id="reward_coupon_duration_months"
                                type="number"
                                min="1"
                                value={data.reward_coupon_duration_months}
                                onChange={(e) => setData('reward_coupon_duration_months', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="Indefinido"
                            />
                            <InputError message={errors.reward_coupon_duration_months} className="mt-1" />
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-brand-border-subtle pt-6">
                <InputLabel value="Preguntas *" />
                <p className="mt-1 text-xs text-brand-text-secondary">
                    Agregá, quitá o reordená las preguntas que va a ver el usuario.
                </p>
                <div className="mt-3">
                    <SurveyQuestionBuilder
                        questions={data.questions}
                        setQuestions={(questions) => setData('questions', questions)}
                        errors={errors}
                    />
                </div>
            </div>

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
