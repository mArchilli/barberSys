import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from '@tabler/icons-react';

function emptyQuestion(order) {
    return {
        type: 'rating',
        question_text: '',
        order,
        scale_min: 1,
        scale_max: 5,
    };
}

export default function SurveyQuestionBuilder({ questions, setQuestions, errors = {} }) {
    function updateQuestion(index, patch) {
        setQuestions(questions.map((question, i) => (i === index ? { ...question, ...patch } : question)));
    }

    function addQuestion() {
        setQuestions([...questions, emptyQuestion(questions.length)]);
    }

    function removeQuestion(index) {
        setQuestions(questions.filter((_, i) => i !== index).map((question, i) => ({ ...question, order: i })));
    }

    function moveQuestion(index, direction) {
        const target = index + direction;

        if (target < 0 || target >= questions.length) {
            return;
        }

        const next = [...questions];
        [next[index], next[target]] = [next[target], next[index]];
        setQuestions(next.map((question, i) => ({ ...question, order: i })));
    }

    return (
        <div className="space-y-4">
            {questions.map((question, index) => (
                <div
                    key={question.id ?? `new-${index}`}
                    className="rounded-brand-md border border-brand-border bg-brand-surface-alt p-4"
                >
                    <div className="flex items-start justify-between gap-3">
                        <span className="mt-2 shrink-0 text-xs font-semibold uppercase tracking-wide text-brand-text-secondary">
                            Pregunta {index + 1}
                        </span>
                        <div className="flex shrink-0 items-center gap-1">
                            <button
                                type="button"
                                onClick={() => moveQuestion(index, -1)}
                                disabled={index === 0}
                                className="rounded-brand-sm p-2 text-brand-text-secondary transition hover:bg-brand-surface hover:text-brand-text disabled:opacity-30"
                                aria-label="Subir pregunta"
                            >
                                <IconArrowUp size={16} stroke={2} />
                            </button>
                            <button
                                type="button"
                                onClick={() => moveQuestion(index, 1)}
                                disabled={index === questions.length - 1}
                                className="rounded-brand-sm p-2 text-brand-text-secondary transition hover:bg-brand-surface hover:text-brand-text disabled:opacity-30"
                                aria-label="Bajar pregunta"
                            >
                                <IconArrowDown size={16} stroke={2} />
                            </button>
                            <button
                                type="button"
                                onClick={() => removeQuestion(index)}
                                disabled={questions.length === 1}
                                className="rounded-brand-sm p-2 text-brand-danger transition hover:bg-brand-danger-soft disabled:opacity-30"
                                aria-label="Quitar pregunta"
                            >
                                <IconTrash size={16} stroke={2} />
                            </button>
                        </div>
                    </div>

                    <div className="mt-3 grid gap-4 sm:grid-cols-[160px_1fr]">
                        <div>
                            <InputLabel value="Tipo" />
                            <select
                                value={question.type}
                                onChange={(e) => {
                                    const type = e.target.value;
                                    updateQuestion(index, {
                                        type,
                                        scale_min: type === 'rating' ? (question.scale_min ?? 1) : null,
                                        scale_max: type === 'rating' ? (question.scale_max ?? 5) : null,
                                    });
                                }}
                                className="mt-1 block w-full rounded-brand-sm border-brand-border bg-brand-surface text-sm text-brand-text shadow-sm focus:border-brand-primary focus:ring-brand-primary"
                            >
                                <option value="rating">Puntaje</option>
                                <option value="text">Texto libre</option>
                            </select>
                        </div>

                        <div>
                            <InputLabel value="Pregunta" />
                            <TextInput
                                value={question.question_text}
                                onChange={(e) => updateQuestion(index, { question_text: e.target.value })}
                                className="mt-1 block w-full"
                                placeholder="Ej: ¿Qué tan fácil te resultó cargar tus cortes?"
                            />
                            <InputError message={errors[`questions.${index}.question_text`]} className="mt-1" />
                        </div>
                    </div>

                    {question.type === 'rating' && (
                        <div className="mt-3 grid grid-cols-2 gap-4 sm:w-64">
                            <div>
                                <InputLabel value="Escala mínima" />
                                <TextInput
                                    type="number"
                                    min="0"
                                    value={question.scale_min ?? 1}
                                    onChange={(e) => updateQuestion(index, { scale_min: Number(e.target.value) })}
                                    className="mt-1 block w-full"
                                />
                            </div>
                            <div>
                                <InputLabel value="Escala máxima" />
                                <TextInput
                                    type="number"
                                    min="1"
                                    value={question.scale_max ?? 5}
                                    onChange={(e) => updateQuestion(index, { scale_max: Number(e.target.value) })}
                                    className="mt-1 block w-full"
                                />
                            </div>
                        </div>
                    )}
                </div>
            ))}

            <InputError message={errors.questions} className="mt-1" />

            <SecondaryButton type="button" onClick={addQuestion} className="gap-2">
                <IconPlus size={16} stroke={2} />
                Agregar pregunta
            </SecondaryButton>
        </div>
    );
}
