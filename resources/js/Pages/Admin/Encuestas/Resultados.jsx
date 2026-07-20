import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

function RatingQuestion({ question }) {
    const maxCount = Math.max(1, ...Object.values(question.distribution));
    const scaleValues = [];
    for (let i = question.scale_min; i <= question.scale_max; i++) {
        scaleValues.push(i);
    }

    return (
        <div className="rounded-brand-md border border-brand-border bg-brand-surface-alt p-4">
            <p className="text-sm font-semibold text-brand-text">{question.question_text}</p>
            <p className="mt-1 text-xs text-brand-text-secondary">
                Promedio: {question.average ?? '—'} · {question.responses_count} respuestas
            </p>
            <div className="mt-3 space-y-1.5">
                {scaleValues.map((value) => {
                    const count = question.distribution[value] ?? 0;

                    return (
                        <div key={value} className="flex items-center gap-2 text-xs text-brand-text-secondary">
                            <span className="w-4 shrink-0 text-right">{value}</span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-brand-border">
                                <div
                                    className="h-full rounded-full bg-brand-primary"
                                    style={{ width: `${(count / maxCount) * 100}%` }}
                                />
                            </div>
                            <span className="w-6 shrink-0">{count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function TextQuestion({ question }) {
    return (
        <div className="rounded-brand-md border border-brand-border bg-brand-surface-alt p-4">
            <p className="text-sm font-semibold text-brand-text">{question.question_text}</p>
            {question.answers.length === 0 ? (
                <p className="mt-2 text-xs text-brand-text-secondary">Todavía no hay respuestas.</p>
            ) : (
                <ul className="mt-3 space-y-2">
                    {question.answers.map((answer, index) => (
                        <li
                            key={index}
                            className="rounded-brand-sm border border-brand-border-subtle bg-brand-surface px-3 py-2 text-sm text-brand-text"
                        >
                            {answer}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function Resultados({ survey, funnel, questions }) {
    return (
        <AdminLayout
            header={
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-brand-text">
                        Resultados: {survey.title}
                    </h2>
                    <Link
                        href={route('admin.surveys.index')}
                        className="text-sm text-brand-text-secondary hover:text-brand-text"
                    >
                        ← Volver a Encuestas
                    </Link>
                </div>
            }
        >
            <Head title={`Resultados: ${survey.title}`} />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-3 gap-4 rounded-brand-lg border border-brand-border bg-brand-surface p-6 shadow-brand-card">
                        <div>
                            <p className="text-xs uppercase text-brand-text-secondary">Mostradas</p>
                            <p className="mt-1 text-2xl font-bold text-brand-text">{funnel.total_responses}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-brand-text-secondary">Completadas</p>
                            <p className="mt-1 text-2xl font-bold text-brand-success">{funnel.completed}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-brand-text-secondary">Salteadas</p>
                            <p className="mt-1 text-2xl font-bold text-brand-text-secondary">{funnel.skipped}</p>
                        </div>
                        <div className="col-span-3 border-t border-brand-border-subtle pt-4">
                            <p className="text-xs uppercase text-brand-text-secondary">% de finalización</p>
                            <p className="mt-1 text-lg font-semibold text-brand-text">
                                {funnel.completion_rate !== null ? `${funnel.completion_rate}%` : '—'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {questions.map((question) =>
                            question.type === 'rating' ? (
                                <RatingQuestion key={question.id} question={question} />
                            ) : (
                                <TextQuestion key={question.id} question={question} />
                            ),
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
