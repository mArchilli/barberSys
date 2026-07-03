import { forwardRef, useState } from 'react';
import { IconEye, IconEyeOff } from '@tabler/icons-react';

export default forwardRef(function PasswordInput(
    { className = '', error = false, ...props },
    ref,
) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <input
                {...props}
                ref={ref}
                type={visible ? 'text' : 'password'}
                className={`w-full rounded-brand-md border bg-brand-bg px-4 py-2.5 pr-11 text-sm text-brand-text transition-colors duration-150 placeholder:text-brand-text-secondary/70 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 ${
                    error
                        ? 'border-brand-danger focus:border-brand-danger'
                        : 'border-brand-border focus:border-brand-primary'
                } ${className}`}
            />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                tabIndex={-1}
                aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-brand-text-secondary transition-colors duration-150 hover:text-brand-primary focus:outline-none"
            >
                {visible ? (
                    <IconEyeOff className="h-5 w-5" stroke={1.8} />
                ) : (
                    <IconEye className="h-5 w-5" stroke={1.8} />
                )}
            </button>
        </div>
    );
});
