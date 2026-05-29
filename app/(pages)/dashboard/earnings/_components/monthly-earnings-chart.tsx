'use client';

import { useMemo } from 'react';
import {
	Area,
	Bar,
	CartesianGrid,
	ComposedChart,
	Line,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { Skeleton } from '@/components/ui';
import { formatOverviewCurrency } from '../../_utils/compute-overview-stats';
import type { EarningsWeekBar } from '../../_utils/compute-earnings-stats';

const CAMEL = 'var(--color-camel)';
const CAMEL_DARK = 'var(--color-camel-dark)';

type ChartDatum = {
	label: string;
	revenue: number;
	revenueFormatted: string;
};

type MonthlyEarningsChartProps = {
	bars: EarningsWeekBar[];
	loading?: boolean;
};

type EarningsTooltipProps = {
	active?: boolean;
	payload?: Array<{ payload: ChartDatum }>;
};

const compactAxisLabel = (value: number) => {
	if (value >= 1000) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			notation: 'compact',
			maximumFractionDigits: 1,
		}).format(value);
	}
	return formatOverviewCurrency(value);
};

function EarningsTooltip({ active, payload }: EarningsTooltipProps) {
	if (!active || !payload?.length) return null;

	const data = payload[0].payload;

	return (
		<div className="rounded-lg border border-camel/20 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm">
			<p className="text-[10px] uppercase tracking-[0.16em] text-[#1A1A1A]/45">{data.label}</p>
			<p className="font-serif text-lg leading-none text-camel-dark">{data.revenueFormatted}</p>
		</div>
	);
}

export function MonthlyEarningsChart({ bars, loading = false }: MonthlyEarningsChartProps) {
	const chartData = useMemo<ChartDatum[]>(
		() =>
			bars.map((bar) => ({
				label: bar.label,
				revenue: bar.revenue,
				revenueFormatted: bar.revenueFormatted,
			})),
		[bars],
	);

	const maxRevenue = useMemo(() => Math.max(...bars.map((bar) => bar.revenue), 0), [bars]);
	const hasRevenue = maxRevenue > 0;

	if (loading) {
		return (
			<div className="mt-8 rounded-xl border border-black/[0.04] bg-[#faf9f6]/60 p-4 md:p-6">
				<Skeleton className="h-[220px] w-full rounded-lg bg-black/8" />
			</div>
		);
	}

	return (
		<div className="relative mt-8 overflow-hidden rounded-xl border border-black/[0.04] bg-linear-to-br from-[#faf9f6] via-white/90 to-camel/[0.06] p-4 md:p-6">
			<div
				className="pointer-events-none absolute inset-0 opacity-[0.35]"
				style={{
					backgroundImage:
						'radial-gradient(circle at 85% 12%, color-mix(in srgb, var(--color-camel) 18%, transparent), transparent 42%), radial-gradient(circle at 8% 88%, color-mix(in srgb, var(--color-espresso) 6%, transparent), transparent 38%)',
				}}
			/>

			<div
				className="relative z-10 h-[220px] w-full"
				role="img"
				aria-label="Weekly earnings chart for the current month"
			>
				<ResponsiveContainer width="100%" height="100%">
					<ComposedChart data={chartData} margin={{ top: 16, right: 12, bottom: 4, left: 0 }}>
						<defs>
							<linearGradient id="earnings-area-fill" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor={CAMEL} stopOpacity={0.34} />
								<stop offset="100%" stopColor={CAMEL} stopOpacity={0.02} />
							</linearGradient>
							<linearGradient id="earnings-line-stroke" x1="0" y1="0" x2="1" y2="0">
								<stop offset="0%" stopColor={CAMEL_DARK} />
								<stop offset="100%" stopColor={CAMEL} />
							</linearGradient>
						</defs>

						<CartesianGrid strokeDasharray="4 6" stroke="#1A1A1A" strokeOpacity={0.06} vertical={false} />

						<XAxis
							dataKey="label"
							axisLine={false}
							tickLine={false}
							tick={{ fill: 'rgba(26,26,26,0.45)', fontSize: 11 }}
							dy={10}
						/>

						<YAxis
							axisLine={false}
							tickLine={false}
							tickFormatter={compactAxisLabel}
							tick={{ fill: 'rgba(26,26,26,0.4)', fontSize: 10 }}
							width={48}
							tickCount={4}
							domain={[0, 'auto']}
						/>

						<Tooltip
							content={<EarningsTooltip />}
							cursor={{ stroke: CAMEL, strokeOpacity: 0.35, strokeDasharray: '3 5' }}
						/>

						<Bar
							dataKey="revenue"
							barSize={28}
							radius={[6, 6, 0, 0]}
							fill={CAMEL}
							fillOpacity={0.14}
							activeBar={{ fill: CAMEL, fillOpacity: 0.28 }}
							isAnimationActive
							animationDuration={700}
							animationEasing="ease-out"
						/>

						<Area
							type="monotone"
							dataKey="revenue"
							stroke="none"
							fill="url(#earnings-area-fill)"
							isAnimationActive
							animationDuration={900}
							animationEasing="ease-out"
						/>

						<Line
							type="monotone"
							dataKey="revenue"
							stroke="url(#earnings-line-stroke)"
							strokeWidth={2.25}
							dot={{
								r: 4.5,
								fill: '#fff',
								stroke: CAMEL,
								strokeWidth: 2,
							}}
							activeDot={{
								r: 6,
								fill: CAMEL,
								stroke: '#fff',
								strokeWidth: 2.5,
							}}
							isAnimationActive
							animationDuration={1100}
							animationEasing="ease-out"
						/>
					</ComposedChart>
				</ResponsiveContainer>
			</div>

			{!hasRevenue ? (
				<div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
					<p className="rounded-full border border-black/[0.06] bg-white/80 px-4 py-2 text-sm text-[#1A1A1A]/50 backdrop-blur-sm">
						No revenue recorded this month yet
					</p>
				</div>
			) : null}
		</div>
	);
}
