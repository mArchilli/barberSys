import { IconCheck, IconX } from '@tabler/icons-react';

export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

export default function PasswordRequirements({ password }) {
    const checks = [
        { label: 'Al menos 8 caracteres', met: password.length >= 8 },
        { label: 'Una letra mayúscula', met: /[A-Z]/.test(password) },
        { label: 'Un símbolo (!@#$%...)', met: /[^A-Za-z0-9]/.test(password) },
    ];

    return (
        <ul className="mt-2 space-y-1">
            {checks.map((check) => (
                <li
                    key={check.label}
                    className={`flex items-center gap-1.5 text-xs font-medium ${
                        check.met ? 'text-brand-success' : 'text-brand-text-secondary'
                    }`}
                >
                    {check.met ? (
                        <IconCheck className="h-3.5 w-3.5" stroke={2.8} />
                    ) : (
                        <IconX className="h-3.5 w-3.5" stroke={2.2} />
                    )}
                    {check.label}
                </li>
            ))}
        </ul>
    );
}
