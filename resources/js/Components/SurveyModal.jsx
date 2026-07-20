import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { subscribeTourActivity, isTourActive } from '@/Hooks/tourActivity';
import { router, usePage } from '@inertiajs/react';
import { IconStar, IconStarFilled } from '@tabler/icons-react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

const MIN_TEXT_LENGTH = 10;

function isAnswered(question, answer) {
    if (question.type === 'rating') {
        return typeof answer?.rating_value === 'number';
    }

    return (answer?.text_value ?? '').trim().length >= MIN_TEXT_LENGTH;
}

function RatingInput({ question, value, onChange }) {
    const useStars = question.scale_min === 1 && question.scale_max <= 5;
    const options = [];
    for (let i = question.scale_min; i <= question.scale_max; i++) {
        options.push(i);
    }

    if (useStars) {
        return (
            <div className="flex items-center gap-1">
                {options.map((option) => {
                    const Icon = value >= option ? IconStarFilled : IconStar;

                    return (
                        <button
                            key={option}
                            type="button"
                            onClick={() => onChange(option)}
                            aria-label={`${option} de ${question.scale_max}`}
                            aria-pressed={value === option}
                            className="flex min-h-[44px] min-w-[44px] items-center justify-center text-brand-primary transition hover:scale-105"
                        >
                            <Icon size={28} stroke={1.8} />
                        </button>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-2">
            {options.map((option) => (
                <button
                    key={option}
                    type="button"
                    onClick={() => onChange(option)}
                    aria-pressed={value === option}
                    className={`min-h-[44px] min-w-[44px] rounded-brand-pill border px-3 text-sm font-semibold transition ${
                        value === option
                            ? 'border-transparent bg-brand-primary text-brand-on-primary shadow-brand-cta'
                            : 'border-brand-border bg-brand-surface-alt text-brand-text-secondary hover:bg-brand-border/40'
                    }`}
                >
                    {option}
                </button>
            ))}
        </div>
    );
}

/**
 * Entrega global de la encuesta pendiente (owner o barber, ver
 * Survey::pendingFor). No debe competir por atención con un tour de driver.js:
 * se suscribe a tourActivity (ver usePageTour) y espera a que termine o se
 * saltee antes de aparecer.
 *
 * Se renderiza inline (NUNCA vía portal/Dialog): las variables de tema oscuro
 * (--brand-*) están scopeadas a la clase `.panel-theme` del layout, y un
 * portal (como el que usa el <Modal> compartido vía HeadlessUI) escapa de ese
 * árbol y cae a los valores claros de :root — mismo problema ya documentado
 * para el popover de driver.js en resources/css/app.css.
 */
export default function SurveyModal() {
    const { pendingSurvey, flash } = usePage().props;
    const tourActive = useSyncExternalStore(subscribeTourActivity, isTourActive, isTourActive);

    const [phase, setPhase] = useState('form'); // 'form' | 'reward'
    const [stepIndex, setStepIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [formError, setFormError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [entered, setEntered] = useState(false);
    const lastSurveyId = useRef(null);

    useEffect(() => {
        // Mientras se muestra el premio no se debe pisar la pantalla con la
        // próxima encuesta encolada, aunque el server ya la haya devuelto.
        if (phase === 'reward') {
            return;
        }

        if (pendingSurvey && pendingSurvey.id !== lastSurveyId.current) {
            lastSurveyId.current = pendingSurvey.id;
            setAnswers({});
            setFormError(null);
            setStepIndex(0);
        }
    }, [pendingSurvey, phase]);

    const visible = phase === 'reward' || (Boolean(pendingSurvey) && !tourActive);

    useEffect(() => {
        if (!visible) {
            setEntered(false);
            return undefined;
        }

        const frame = requestAnimationFrame(() => setEntered(true));
        return () => cancelAnimationFrame(frame);
    }, [visible]);

    if (!visible) {
        return null;
    }

    function setAnswer(questionId, patch) {
        setAnswers((prev) => ({ ...prev, [questionId]: { ...prev[questionId], ...patch } }));
    }

    function handleSkip() {
        setSubmitting(true);
        router.post(
            route('surveys.skip', pendingSurvey.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setSubmitting(false),
            },
        );
    }

    function submitAnswers() {
        setFormError(null);

        const payload = pendingSurvey.questions.map((question) => ({
            question_id: question.id,
            rating_value: question.type === 'rating' ? (answers[question.id]?.rating_value ?? null) : null,
            text_value: question.type === 'text' ? (answers[question.id]?.text_value ?? '') : null,
        }));

        setSubmitting(true);
        router.post(
            route('surveys.respond', pendingSurvey.id),
            { answers: payload },
            {
                preserveScroll: true,
                onSuccess: () => setPhase('reward'),
                onError: (errors) => setFormError(errors.answers ?? 'Revisá tus respuestas antes de enviar.'),
                onFinish: () => setSubmitting(false),
            },
        );
    }

    function handleNext(currentQuestion, isLast) {
        if (!isAnswered(currentQuestion, answers[currentQuestion.id])) {
            return;
        }

        if (isLast) {
            submitAnswers();
            return;
        }

        setStepIndex((index) => index + 1);
    }

    function handleBack() {
        setFormError(null);
        setStepIndex((index) => Math.max(0, index - 1));
    }

    const reward = flash?.surveyReward;

    const panelClassName = `pointer-events-auto w-full overflow-hidden border-brand-border bg-brand-surface shadow-brand-floating transition-all duration-300 ease-out motion-reduce:transition-none sm:max-w-sm sm:rounded-brand-lg sm:border ${
        entered ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 sm:translate-y-4'
    } rounded-t-brand-lg border-t pb-[env(safe-area-inset-bottom)] sm:pb-0`;

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center sm:inset-x-auto sm:bottom-6 sm:right-6 sm:justify-end">
            <div className={panelClassName} role="dialog" aria-modal="false" aria-label="Encuesta">
                {phase === 'reward' ? (
                    <div className="flex flex-col gap-4 p-6 text-center">
                        <h3 className="font-display text-lg font-bold text-brand-text">
                            ¡Gracias por tu respuesta!
                        </h3>

                        {reward ? (
                            <>
                                <p className="text-sm text-brand-text-secondary">
                                    Ganaste un cupón de descuento para tu suscripción:
                                </p>
                                <div className="rounded-brand-md border border-brand-primary/30 bg-brand-primary-soft px-4 py-3">
                                    <p className="text-lg font-bold tracking-wide text-brand-primary-soft-text">
                                        {reward.code}
                                    </p>
                                    <p className="mt-1 text-sm text-brand-primary-soft-text">
                                        {reward.type === 'percentage'
                                            ? `${reward.value}% de descuento`
                                            : `$${reward.value} de descuento`}
                                        {reward.duration_months
                                            ? ` durante ${reward.duration_months} ${reward.duration_months === 1 ? 'mes' : 'meses'}`
                                            : ''}
                                    </p>
                                </div>
                                <p className="text-xs text-brand-text-secondary">
                                    Ya lo aplicamos a tu suscripción automáticamente.
                                </p>
                            </>
                        ) : (
                            <p className="text-sm text-brand-text-secondary">Tu respuesta quedó registrada.</p>
                        )}

                        <PrimaryButton
                            type="button"
                            onClick={() => setPhase('form')}
                            className="mt-2 w-full justify-center"
                        >
                            Listo
                        </PrimaryButton>
                    </div>
                ) : (
                    (() => {
                        const totalQuestions = pendingSurvey.questions.length;
                        const currentQuestion = pendingSurvey.questions[stepIndex];
                        const isLast = stepIndex === totalQuestions - 1;
                        const answer = answers[currentQuestion.id];
                        const canAdvance = isAnswered(currentQuestion, answer);

                        return (
                            <div className="flex flex-col">
                                <div className="border-b border-brand-border-subtle px-5 py-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="font-display text-base font-bold text-brand-text">
                                            {pendingSurvey.title}
                                        </h3>
                                        <span className="shrink-0 text-xs font-medium text-brand-text-secondary">
                                            {stepIndex + 1}/{totalQuestions}
                                        </span>
                                    </div>
                                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-brand-border-subtle">
                                        <div
                                            className="h-full rounded-full bg-brand-primary transition-all duration-300 motion-reduce:transition-none"
                                            style={{ width: `${((stepIndex + 1) / totalQuestions) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="px-5 py-5">
                                    {formError && (
                                        <div className="mb-4 rounded-brand-md border border-brand-danger/30 bg-brand-danger-soft px-4 py-3 text-sm text-brand-danger">
                                            {formError}
                                        </div>
                                    )}

                                    <p className="text-sm font-semibold text-brand-text">
                                        {currentQuestion.question_text}
                                    </p>

                                    {currentQuestion.type === 'rating' ? (
                                        <div className="mt-3">
                                            <RatingInput
                                                question={currentQuestion}
                                                value={answer?.rating_value ?? null}
                                                onChange={(value) =>
                                                    setAnswer(currentQuestion.id, { rating_value: value })
                                                }
                                            />
                                        </div>
                                    ) : (
                                        <div className="mt-3">
                                            <textarea
                                                value={answer?.text_value ?? ''}
                                                onChange={(e) =>
                                                    setAnswer(currentQuestion.id, { text_value: e.target.value })
                                                }
                                                rows={3}
                                                autoFocus
                                                className="block w-full rounded-brand-sm border-brand-border bg-brand-surface-alt text-sm text-brand-text shadow-sm focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
                                                placeholder="Contanos con tus palabras..."
                                            />
                                            <p className="mt-1 text-xs text-brand-text-secondary">
                                                {(answer?.text_value ?? '').trim().length}/{MIN_TEXT_LENGTH} caracteres
                                                mínimo
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between gap-3 border-t border-brand-border-subtle px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={handleSkip}
                                        disabled={submitting}
                                        className="min-h-[44px] px-1 text-sm font-medium text-brand-text-secondary transition hover:text-brand-text disabled:opacity-50"
                                    >
                                        Saltear
                                    </button>

                                    <div className="flex items-center gap-2">
                                        {stepIndex > 0 && (
                                            <SecondaryButton
                                                type="button"
                                                onClick={handleBack}
                                                disabled={submitting}
                                                className="min-h-[44px]"
                                            >
                                                Atrás
                                            </SecondaryButton>
                                        )}
                                        <PrimaryButton
                                            type="button"
                                            onClick={() => handleNext(currentQuestion, isLast)}
                                            disabled={submitting || !canAdvance}
                                            className="min-h-[44px]"
                                        >
                                            {isLast ? 'Enviar respuestas' : 'Siguiente'}
                                        </PrimaryButton>
                                    </div>
                                </div>
                            </div>
                        );
                    })()
                )}
            </div>
        </div>
    );
}
