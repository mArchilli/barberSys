import { IconMenu2 } from '@tabler/icons-react';

export default function MobileMenuButton({ onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label="Abrir menú"
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-brand-pill text-brand-text-secondary transition hover:bg-brand-primary-soft hover:text-brand-link md:hidden"
        >
            <IconMenu2 size={22} stroke={1.75} />
        </button>
    );
}
