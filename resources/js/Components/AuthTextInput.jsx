import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function AuthTextInput(
    { type = 'text', className = '', isFocused = false, error = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            ref={localRef}
            className={`w-full rounded-brand-md border bg-brand-bg px-4 py-2.5 text-sm text-brand-text transition-colors duration-150 placeholder:text-brand-text-secondary/70 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 ${
                error
                    ? 'border-brand-danger focus:border-brand-danger'
                    : 'border-brand-border focus:border-brand-primary'
            } ${className}`}
        />
    );
});
