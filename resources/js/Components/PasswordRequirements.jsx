import { IconCheck, IconX } from '@tabler/icons-react';

export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

export default function PasswordRequirements({ password, horizontal = false }) {
    const checks = [
        { label: 'Al menos 8 caracteres', met: password.length >= 8 },
        { label: 'Una letra mayúscula', met: /[A-Z]/.test(password) },
        { label: 'Un símbolo (!@#$%...)', met: /[^A-Za-z0-9]/.test(password) },
    ];

    return (
        <ul
            className={
                horizontal
                    ? 'mt-2 grid grid-cols-3 gap-1.5 sm:gap-3'
                    : 'mt-2 space-y-1'
            }
        >
            {checks.map((check) => (
                <li
                    key={check.label}
                    className={`flex gap-1 font-medium sm:gap-1.5 ${
                        horizontal
                            ? 'min-w-0 items-start text-[0.625rem] leading-4 sm:text-xs'
                            : 'items-center text-xs'
                    } ${
                        check.met ? 'text-brand-success' : 'text-brand-text-secondary'
                    }`}
                >
                    {check.met ? (
                        <IconCheck className="h-3.5 w-3.5 shrink-0" stroke={2.8} />
                    ) : (
                        <IconX className="h-3.5 w-3.5 shrink-0" stroke={2.2} />
                    )}
                    <span>{check.label}</span>
                </li>
            ))}
        </ul>
    );
}
