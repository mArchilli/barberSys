import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register({ plans }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        plan_id: plans?.[0]?.id ?? '',
        barberia_name: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const formatPrice = (plan) => {
        if (plan.is_custom) return 'A medida';
        return `$${Number(plan.price).toLocaleString('es-AR')}`;
    };

    const formatLimit = (value) => (value === null ? 'Ilimitado' : value);

    return (
        <GuestLayout>
            <Head title="Registrarse" />

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="name" value="Nombre" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Contraseña" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password_confirmation" value="Confirmar contraseña" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="mt-6">
                    <InputLabel value="Plan" />
                    <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {plans.map((plan) => (
                            <label
                                key={plan.id}
                                className={`cursor-pointer rounded-brand-md border-2 p-4 transition-colors ${
                                    data.plan_id === plan.id
                                        ? 'border-brand-primary bg-brand-primary-soft'
                                        : 'border-brand-border hover:border-brand-primary-muted'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="plan_id"
                                    value={plan.id}
                                    checked={data.plan_id === plan.id}
                                    onChange={() => setData('plan_id', plan.id)}
                                    className="sr-only"
                                />
                                <div className="font-semibold text-brand-text">{plan.name}</div>
                                <div className="mt-1 text-sm text-brand-text-secondary">
                                    {formatLimit(plan.max_barberias)} barbería
                                    {plan.max_barberias !== 1 ? 's' : ''} ·{' '}
                                    {formatLimit(plan.max_barberos)} barbero
                                    {plan.max_barberos !== 1 ? 's' : ''}
                                </div>
                                <div className="mt-2 text-lg font-bold text-brand-primary">
                                    {formatPrice(plan)}
                                </div>
                            </label>
                        ))}
                    </div>
                    <InputError message={errors.plan_id} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="barberia_name" value="Nombre de tu barbería" />
                    <TextInput
                        id="barberia_name"
                        name="barberia_name"
                        value={data.barberia_name}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('barberia_name', e.target.value)}
                        required
                    />
                    <InputError message={errors.barberia_name} className="mt-2" />
                </div>

                <div className="mt-6 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-brand-text-secondary underline hover:text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
                    >
                        ¿Ya tenés cuenta?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Registrarse
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
