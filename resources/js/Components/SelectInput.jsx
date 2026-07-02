import { forwardRef } from 'react';

export default forwardRef(function SelectInput(
    { className = '', children, ...props },
    ref,
) {
    return (
        <select
            {...props}
            ref={ref}
            className={
                'rounded-md border-brand-border shadow-sm focus:border-brand-primary focus:ring-brand-primary ' +
                className
            }
        >
            {children}
        </select>
    );
});
