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
import { DashboardTheme, useDashboardThemeStore } from '@/store/dashboard-theme';
import { formatOverviewCurrency } from '../../_utils/compute-overview-stats';
import type { EarningsWeekBar } from '../../_utils/compute-earnings-stats';

const CAMEL = 'var(--color-camel)';
const CAMEL_DARK = 'var(--color-camel-dark)';
const CHART_GRID = 'var(--earnings-chart-grid)';
const CHART_TICK = 'var(--earnings-chart-tick)';
const CHART_TICK_MUTED = 'var(--earnings-chart-tick-muted)';
const CHART_DOT_FILL = 'var(--earnings-chart-dot-fill)';

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
		<div className="rounded-lg border border-camel/25 bg-dashboard-inset px-3 py-2 shadow-[var(--shadow-dashboard-panel)]">
			<p className="text-[10px] uppercase tracking-[0.16em] text-dashboard-muted">{data.label}</p>
			<p className="font-serif text-lg leading-none text-camel">{data.revenueFormatted}</p>
		</div>
	);
}

export function MonthlyEarningsChart({ bars, loading = false }: MonthlyEarningsChartProps) {
	const theme = useDashboardThemeStore((state) => state.theme);
	const isDark = theme === DashboardTheme.DARK;

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

	const barOpacity = isDark ? 0.24 : 0.14;
	const barActiveOpacity = isDark ? 0.42 : 0.28;
	const areaTopOpacity = isDark ? 0.42 : 0.34;

	if (loading) {
		return (
			<div className="mt-8 rounded-xl border border-[color:var(--earnings-chart-border)] bg-dashboard-inset/60 p-4 md:p-6">
				<Skeleton className="h-[220px] w-full rounded-lg bg-black/8" />
			</div>
		);
	}

	return (
		<div
			className="relative mt-8 overflow-hidden rounded-xl border border-[color:var(--earnings-chart-border)] p-4 md:p-6"
			style={{
				background:
					'linear-gradient(135deg, var(--earnings-chart-bg-from) 0%, var(--earnings-chart-bg-via) 48%, var(--earnings-chart-bg-to) 100%)',
			}}
		>
			<div
				className="pointer-events-none absolute inset-0 opacity-[0.35]"
				style={{
					backgroundImage:
						'radial-gradient(circle at 85% 12%, var(--earnings-chart-glow-a), transparent 42%), radial-gradient(circle at 8% 88%, var(--earnings-chart-glow-b), transparent 38%)',
				}}
			/>

			<div
				className="relative z-10 h-[220px] w-full"
				role="img"
				aria-label="Weekly earnings chart for the current month"
			>
				<ResponsiveContainer width="100%" height="100%" key={theme}>
					<ComposedChart data={chartData} margin={{ top: 16, right: 12, bottom: 4, left: 0 }}>
						<defs>
							<linearGradient id="earnings-area-fill" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor={CAMEL} stopOpacity={areaTopOpacity} />
								<stop offset="100%" stopColor={CAMEL} stopOpacity={isDark ? 0.04 : 0.02} />
							</linearGradient>
							<linearGradient id="earnings-line-stroke" x1="0" y1="0" x2="1" y2="0">
								<stop offset="0%" stopColor={CAMEL_DARK} />
								<stop offset="100%" stopColor={CAMEL} />
							</linearGradient>
						</defs>

						<CartesianGrid strokeDasharray="4 6" stroke={CHART_GRID} vertical={false} />

						<XAxis
							dataKey="label"
							axisLine={false}
							tickLine={false}
							tick={{ fill: CHART_TICK, fontSize: 11 }}
							dy={10}
						/>

						<YAxis
							axisLine={false}
							tickLine={false}
							tickFormatter={compactAxisLabel}
							tick={{ fill: CHART_TICK_MUTED, fontSize: 10 }}
							width={48}
							tickCount={4}
							domain={[0, 'auto']}
						/>

						<Tooltip
							content={<EarningsTooltip />}
							cursor={{ stroke: CAMEL, strokeOpacity: isDark ? 0.5 : 0.35, strokeDasharray: '3 5' }}
						/>

						<Bar
							dataKey="revenue"
							barSize={28}
							radius={[6, 6, 0, 0]}
							fill={CAMEL}
							fillOpacity={barOpacity}
							activeBar={{ fill: CAMEL, fillOpacity: barActiveOpacity }}
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
								fill: CHART_DOT_FILL,
								stroke: CAMEL,
								strokeWidth: 2,
							}}
							activeDot={{
								r: 6,
								fill: CAMEL,
								stroke: CHART_DOT_FILL,
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
					<p className="rounded-full border border-dashboard-border bg-dashboard-inset px-4 py-2 text-sm text-dashboard-muted">
						No revenue recorded this month yet
					</p>
				</div>
			) : null}
		</div>
	);
}
