const toneClasses = {
    default: 'text-brand-text',
    success: 'text-brand-success',
    danger: 'text-brand-danger',
    warning: 'text-brand-warning',
};

export default function MetricCard({ label, value, tone = 'default' }) {
    return (
        <div className="rounded-brand-lg border border-brand-border bg-brand-surface p-5 shadow-brand-card">
            <p className="text-sm font-medium text-brand-text-secondary">{label}</p>
            <p className={`mt-1 font-display text-3xl font-bold ${toneClasses[tone]}`}>{value}</p>
        </div>
    );
}
