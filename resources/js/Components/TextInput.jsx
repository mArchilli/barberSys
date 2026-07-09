import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
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
            className={
                'rounded-md border border-brand-border bg-brand-surface text-brand-text shadow-sm placeholder:text-brand-text-secondary/70 focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 ' +
                className
            }
            ref={localRef}
        />
    );
});
