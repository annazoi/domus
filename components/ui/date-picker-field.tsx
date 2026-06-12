'use client';

import { forwardRef, useId } from 'react';
import DatePicker from 'react-datepicker';
import { addDays, format, isValid, parse } from 'date-fns';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { cn } from './cn';
import 'react-datepicker/dist/react-datepicker.css';
import './date-picker-field.css';

function parseApiDate(value: string) {
	if (!value) return null;
	const parsed = parse(value, 'yyyy-MM-dd', new Date());
	return isValid(parsed) ? parsed : null;
}

function toApiDate(date: Date) {
	return format(date, 'yyyy-MM-dd');
}

type TriggerProps = {
	value?: string;
	onClick?: () => void;
	placeholder?: string;
	disabled?: boolean;
	id?: string;
};

const DatePickerTrigger = forwardRef<HTMLButtonElement, TriggerProps>(function DatePickerTrigger(
	{ value, onClick, placeholder, disabled, id },
	ref,
) {
	return (
		<button
			ref={ref}
			id={id}
			type="button"
			disabled={disabled}
			onClick={onClick}
			className={cn(
				'flex w-full items-center gap-3 rounded-xl border border-dashboard-border bg-dashboard-surface px-4 py-3 text-left outline-none transition',
				'hover:border-camel/25 focus-visible:border-camel/40 focus-visible:ring-2 focus-visible:ring-camel/12',
				disabled && 'cursor-not-allowed opacity-55',
				!value && 'text-dashboard-muted',
				value && 'text-espresso',
			)}
		>
			<CalendarDays className="h-4 w-4 shrink-0 text-camel/70" aria-hidden />
			<span className="min-w-0 flex-1 truncate text-sm">{value || placeholder}</span>
			<ChevronDown className="h-4 w-4 shrink-0 text-dashboard-muted" aria-hidden />
		</button>
	);
});

export type DatePickerFieldProps = {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	required?: boolean;
	id?: string;
	minDate?: string;
	className?: string;
};

export function DatePickerField({
	value,
	onChange,
	placeholder = 'Select date',
	disabled,
	required,
	id,
	minDate,
	className,
}: DatePickerFieldProps) {
	const fallbackId = useId();
	const fieldId = id ?? fallbackId;
	const selected = parseApiDate(value);
	const minSelectable = minDate
		? addDays(parse(minDate, 'yyyy-MM-dd', new Date()), 1)
		: undefined;

	return (
		<div className={cn('domus-date-picker-field w-full min-w-0', className)}>
			<DatePicker
				selected={selected}
				onChange={(date: Date | null) => onChange(date ? toApiDate(date) : '')}
				minDate={minSelectable}
				disabled={disabled}
				required={required}
				id={fieldId}
				className="domus-date-picker-field__wrapper"
				dateFormat="MMM d, yyyy"
				placeholderText={placeholder}
				showPopperArrow={false}
				popperPlacement="bottom-start"
				popperClassName="domus-react-datepicker-popper"
				calendarClassName="domus-react-datepicker"
				popperProps={{ strategy: 'fixed' }}
				todayButton="Today"
				shouldCloseOnSelect
				customInput={
					<DatePickerTrigger placeholder={placeholder} disabled={disabled} id={fieldId} />
				}
			/>
		</div>
	);
}
