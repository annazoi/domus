'use client';

import {
	Children,
	type ReactNode,
	forwardRef,
	isValidElement,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
	type SelectHTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from './cn';

export type SelectVariant = 'default' | 'dashboard' | 'settings' | 'auth' | 'compact';

const surface = cn(
	'flex w-full cursor-pointer items-center rounded-xl border border-dashboard-border bg-dashboard-surface text-left text-espresso outline-none',
	'transition-[border-color,box-shadow,background-color] duration-150 ease-out',
	'hover:border-camel/28',
	'focus-visible:border-camel/38 focus-visible:ring-1 focus-visible:ring-camel/10',
	'disabled:cursor-not-allowed',
);

const variantTrigger: Record<SelectVariant, string> = {
	default: cn(surface, 'py-3 pl-4 pr-10', 'disabled:bg-cream disabled:text-espresso/38'),
	dashboard: cn(
		surface,
		'rounded-xl py-2.5 pl-3 pr-10 text-sm',
		'disabled:opacity-55',
	),
	settings: cn(surface, 'py-3 pl-4 pr-10 text-sm', 'focus-visible:ring-camel/12', 'disabled:opacity-55'),
	auth: cn(
		'flex w-full cursor-pointer items-center rounded-sm border border-dashboard-border bg-dashboard-surface py-3 pl-4 pr-10 text-left font-light text-espresso outline-none transition duration-150 ease-out',
		'hover:border-camel/35 focus-visible:border-camel/45 focus-visible:ring-1 focus-visible:ring-camel/20',
		'disabled:opacity-60',
	),
	compact: cn(surface, 'py-2.5 pl-3 pr-10 text-sm', 'disabled:opacity-55'),
};

const chevronTone: Record<SelectVariant, string> = {
	default: 'text-dashboard-muted',
	dashboard: 'text-dashboard-muted',
	settings: 'text-dashboard-muted',
	auth: 'text-dashboard-muted',
	compact: 'text-dashboard-muted',
};

type Opt = { value: string; label: string; disabled?: boolean };

function readOptions(children: ReactNode): Opt[] {
	const out: Opt[] = [];
	Children.forEach(children, (child) => {
		if (!isValidElement<{ value?: string; disabled?: boolean; children?: ReactNode }>(child)) return;
		if (child.type !== 'option') return;
		const { value = '', disabled, children: ch } = child.props;
		const label =
			typeof ch === 'string' || typeof ch === 'number'
				? String(ch)
				: Children.toArray(ch)
						.map((c) => (typeof c === 'string' || typeof c === 'number' ? String(c) : ''))
						.join('') || value;
		out.push({ value, label, disabled });
	});
	return out;
}

const menuClassName = cn(
	'dashboard-select-menu max-h-[min(16rem,50vh)] overflow-auto rounded-xl border border-dashboard-border bg-dashboard-panel py-1 shadow-[var(--shadow-dashboard-panel)]',
);

const row = cn(
	'flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm text-espresso transition-colors',
	'hover:bg-dashboard-row-hover focus:outline-none',
	'data-disabled:pointer-events-none data-disabled:opacity-40',
);

type MenuPosition = {
	top?: number;
	bottom?: number;
	left: number;
	width: number;
	maxHeight: number;
};

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { variant?: SelectVariant };

export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
	{
		className,
		variant = 'default',
		disabled,
		children,
		value: valueProp,
		defaultValue,
		onChange,
		id,
		...selectAttrs
	},
	ref,
) {
	const uid = useId();
	const listId = `${uid}-list`;
	const opts = useMemo(() => readOptions(children), [children]);
	const [open, setOpen] = useState(false);
	const [hi, setHi] = useState(0);
	const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
	const rootRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const menuRef = useRef<HTMLUListElement>(null);
	const isControlled = valueProp !== undefined;
	const selected = isControlled ? String(valueProp) : undefined;
	const [uncontrolled, setUncontrolled] = useState(defaultValue !== undefined ? String(defaultValue) : '');
	const current = isControlled ? selected! : uncontrolled;

	const label = opts.find((o) => o.value === current)?.label ?? '';

	const selectAt = useCallback(
		(i: number) => {
			const o = opts[i];
			if (!o || o.disabled) return;
			if (!isControlled) setUncontrolled(o.value);
			onChange?.({ target: { value: o.value } } as React.ChangeEvent<HTMLSelectElement>);
			setOpen(false);
		},
		[isControlled, onChange, opts],
	);

	const updateMenuPosition = useCallback(() => {
		const trigger = triggerRef.current;
		if (!trigger) return;

		const rect = trigger.getBoundingClientRect();
		const gap = 6;
		const preferredMax = Math.min(window.innerHeight * 0.4, 256);
		const spaceBelow = window.innerHeight - rect.bottom - gap;
		const spaceAbove = rect.top - gap;
		const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;
		const maxHeight = Math.min(preferredMax, openUp ? spaceAbove : spaceBelow);

		setMenuPosition({
			left: rect.left,
			width: rect.width,
			maxHeight: Math.max(maxHeight, 120),
			...(openUp
				? { bottom: window.innerHeight - rect.top + gap }
				: { top: rect.bottom + gap }),
		});
	}, []);

	useEffect(() => {
		if (!open) {
			setMenuPosition(null);
			return;
		}

		updateMenuPosition();
		window.addEventListener('resize', updateMenuPosition);
		window.addEventListener('scroll', updateMenuPosition, true);
		return () => {
			window.removeEventListener('resize', updateMenuPosition);
			window.removeEventListener('scroll', updateMenuPosition, true);
		};
	}, [open, updateMenuPosition]);

	useEffect(() => {
		if (!open) return;
		const close = (e: MouseEvent) => {
			const target = e.target as Node;
			if (rootRef.current?.contains(target)) return;
			if (menuRef.current?.contains(target)) return;
			setOpen(false);
		};
		document.addEventListener('mousedown', close);
		return () => document.removeEventListener('mousedown', close);
	}, [open]);

	const onKeyDown = (e: React.KeyboardEvent) => {
		if (disabled) return;
		if (!open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
			e.preventDefault();
			const i = opts.findIndex((o) => o.value === current);
			setHi(i >= 0 ? i : 0);
			setOpen(true);
			return;
		}
		if (!open) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			setOpen(false);
			return;
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			setHi((i) => {
				if (opts.length === 0) return 0;
				let n = i;
				for (let step = 0; step < opts.length; step++) {
					n = (n + 1) % opts.length;
					if (!opts[n]?.disabled) return n;
				}
				return i;
			});
		}
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			setHi((i) => {
				if (opts.length === 0) return 0;
				let n = i;
				for (let step = 0; step < opts.length; step++) {
					n = (n - 1 + opts.length) % opts.length;
					if (!opts[n]?.disabled) return n;
				}
				return i;
			});
		}
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			selectAt(hi);
		}
	};

	const setTriggerRef = (node: HTMLButtonElement | null) => {
		triggerRef.current = node;
		if (typeof ref === 'function') ref(node);
		else if (ref) ref.current = node;
	};

	const menu =
		open && menuPosition
			? createPortal(
					<ul
						ref={menuRef}
						id={listId}
						role="listbox"
						tabIndex={-1}
						className={menuClassName}
						style={{
							position: 'fixed',
							top: menuPosition.top,
							bottom: menuPosition.bottom,
							left: menuPosition.left,
							width: menuPosition.width,
							maxHeight: menuPosition.maxHeight,
							zIndex: 10000,
						}}
					>
						{opts.map((o, i) => {
							const active = i === hi;
							const sel = o.value === current;
							return (
								<li key={o.value} role="presentation">
									<button
										type="button"
										role="option"
										aria-selected={sel}
										data-active={active ? '' : undefined}
										data-disabled={o.disabled ? '' : undefined}
										disabled={o.disabled}
										id={`${uid}-opt-${i}`}
										className={cn(
											row,
											sel && 'bg-camel/12 font-medium text-camel',
											active && !sel && 'bg-dashboard-row-hover',
											active && sel && 'bg-camel/18',
										)}
										onMouseEnter={() => !o.disabled && setHi(i)}
										onClick={() => selectAt(i)}
									>
										<span className="min-w-0 flex-1 truncate">{o.label}</span>
										{sel ? (
											<Check className="h-3.5 w-3.5 shrink-0 text-dashboard-accent" strokeWidth={2} aria-hidden />
										) : null}
									</button>
								</li>
							);
						})}
					</ul>,
					document.body,
				)
			: null;

	return (
		<div ref={rootRef} className={cn('relative w-full', className)}>
			<select
				{...selectAttrs}
				className="sr-only"
				tabIndex={-1}
				aria-hidden
				value={current}
				onChange={() => {}}
				disabled={disabled}
			>
				{children}
			</select>
			<button
				type="button"
				ref={setTriggerRef}
				id={id}
				disabled={disabled}
				role="combobox"
				aria-autocomplete="none"
				aria-expanded={open}
				aria-controls={open ? listId : undefined}
				aria-activedescendant={open ? `${uid}-opt-${hi}` : undefined}
				aria-required={selectAttrs.required}
				className={cn(variantTrigger[variant])}
				onClick={() => {
					if (disabled) return;
					setOpen((prev) => {
						if (!prev) {
							const i = opts.findIndex((o) => o.value === current);
							setHi(i >= 0 ? i : 0);
						}
						return !prev;
					});
				}}
				onKeyDown={onKeyDown}
			>
				<span className="min-w-0 flex-1 truncate">{label}</span>
				<span
					className={cn(
						'pointer-events-none absolute right-3 top-1/2 flex h-[1.125rem] w-[1.125rem] -translate-y-1/2 items-center justify-center transition-transform duration-200',
						open && 'rotate-180',
						chevronTone[variant],
						disabled && 'opacity-35',
					)}
					aria-hidden
				>
					<ChevronDown className="h-full w-full shrink-0" strokeWidth={1.5} />
				</span>
			</button>
			{menu}
		</div>
	);
});

Select.displayName = 'Select';
