'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui';
import { formatOverviewCurrency } from '../../_utils/compute-overview-stats';
import type { EarningsWeekBar } from '../../_utils/compute-earnings-stats';

const CHART_WIDTH = 640;
const CHART_HEIGHT = 220;
const PAD = { top: 20, right: 20, bottom: 36, left: 52 };

type ChartPoint = {
	x: number;
	y: number;
	bar: EarningsWeekBar;
};

type MonthlyEarningsChartProps = {
	bars: EarningsWeekBar[];
	loading?: boolean;
};

const plotWidth = CHART_WIDTH - PAD.left - PAD.right;
const plotHeight = CHART_HEIGHT - PAD.top - PAD.bottom;

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

const buildSmoothLine = (points: ChartPoint[]) => {
	if (points.length === 0) return '';
	if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

	const segments: string[] = [`M ${points[0].x} ${points[0].y}`];

	for (let index = 0; index < points.length - 1; index += 1) {
		const current = points[index];
		const next = points[index + 1];
		const controlX = (current.x + next.x) / 2;
		segments.push(`C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`);
	}

	return segments.join(' ');
};

const buildAreaPath = (points: ChartPoint[]) => {
	if (points.length === 0) return '';
	const baseline = PAD.top + plotHeight;
	const line = buildSmoothLine(points);
	return `${line} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`;
};

export function MonthlyEarningsChart({ bars, loading = false }: MonthlyEarningsChartProps) {
	const [activeIndex, setActiveIndex] = useState<number | null>(null);

	const maxRevenue = useMemo(() => Math.max(...bars.map((bar) => bar.revenue), 0), [bars]);

	const yTicks = useMemo(() => {
		if (maxRevenue === 0) return [0];
		const ticks = [0, 0.33, 0.66, 1].map((ratio) => Math.round(maxRevenue * ratio));
		return [...new Set(ticks)].sort((a, b) => a - b);
	}, [maxRevenue]);

	const points = useMemo<ChartPoint[]>(() => {
		if (bars.length === 0) return [];

		const step = bars.length === 1 ? 0 : plotWidth / (bars.length - 1);

		return bars.map((bar, index) => {
			const ratio = maxRevenue > 0 ? bar.revenue / maxRevenue : 0;
			const y = PAD.top + plotHeight - ratio * plotHeight;
			const x = PAD.left + step * index;
			return { x, y, bar };
		});
	}, [bars, maxRevenue]);

	const linePath = buildSmoothLine(points);
	const areaPath = buildAreaPath(points);
	const activePoint = activeIndex !== null ? points[activeIndex] : null;
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

			<svg
				viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
				className="relative z-10 h-auto w-full"
				role="img"
				aria-label="Weekly earnings chart for the current month"
				onMouseLeave={() => setActiveIndex(null)}
			>
				<defs>
					<linearGradient id="earnings-area-fill" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="var(--color-camel)" stopOpacity="0.34" />
						<stop offset="100%" stopColor="var(--color-camel)" stopOpacity="0.02" />
					</linearGradient>
					<linearGradient id="earnings-line-stroke" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stopColor="var(--color-camel-dark)" />
						<stop offset="100%" stopColor="var(--color-camel)" />
					</linearGradient>
					<filter id="earnings-glow" x="-20%" y="-20%" width="140%" height="140%">
						<feGaussianBlur stdDeviation="2.5" result="blur" />
						<feMerge>
							<feMergeNode in="blur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>

				{yTicks.map((tick) => {
					const ratio = maxRevenue > 0 ? tick / maxRevenue : 0;
					const y = PAD.top + plotHeight - ratio * plotHeight;
					return (
						<g key={tick}>
							<line
								x1={PAD.left}
								y1={y}
								x2={CHART_WIDTH - PAD.right}
								y2={y}
								stroke="currentColor"
								className="text-[#1A1A1A]/[0.06]"
								strokeDasharray="4 6"
							/>
							<text
								x={PAD.left - 10}
								y={y + 4}
								textAnchor="end"
								className="fill-[#1A1A1A]/40 text-[10px] tracking-wide"
							>
								{compactAxisLabel(tick)}
							</text>
						</g>
					);
				})}

				{hasRevenue && areaPath ? (
					<motion.path
						d={areaPath}
						fill="url(#earnings-area-fill)"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
					/>
				) : null}

				{hasRevenue && linePath ? (
					<motion.path
						d={linePath}
						fill="none"
						stroke="url(#earnings-line-stroke)"
						strokeWidth="2.25"
						strokeLinecap="round"
						filter="url(#earnings-glow)"
						initial={{ pathLength: 0, opacity: 0 }}
						animate={{ pathLength: 1, opacity: 1 }}
						transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
					/>
				) : null}

				{points.map((point, index) => {
					const barWidth = Math.min(28, plotWidth / Math.max(bars.length, 1) - 10);
					return (
						<g
							key={point.bar.label}
							onMouseEnter={() => setActiveIndex(index)}
							onFocus={() => setActiveIndex(index)}
							onBlur={() => setActiveIndex(null)}
							tabIndex={0}
							className="cursor-pointer outline-none"
						>
							<rect
								x={point.x - barWidth / 2}
								y={point.y}
								width={barWidth}
								height={PAD.top + plotHeight - point.y}
								rx={6}
								className={`transition-all duration-300 ${
									activeIndex === index ? 'fill-camel/28' : 'fill-camel/14'
								}`}
							/>
							<circle
								cx={point.x}
								cy={point.y}
								r={activeIndex === index ? 6 : 4.5}
								className={`transition-all duration-300 ${
									activeIndex === index
										? 'fill-camel stroke-white stroke-[2.5px]'
										: 'fill-white stroke-camel stroke-[2px]'
								}`}
							/>
							<text
								x={point.x}
								y={CHART_HEIGHT - 10}
								textAnchor="middle"
								className={`text-[11px] tracking-wide transition-colors duration-300 ${
									activeIndex === index ? 'fill-camel' : 'fill-[#1A1A1A]/45'
								}`}
							>
								{point.bar.label}
							</text>
							<title>
								{point.bar.label}: {point.bar.revenueFormatted}
							</title>
						</g>
					);
				})}

				{activePoint ? (
					<g pointerEvents="none">
						<line
							x1={activePoint.x}
							y1={PAD.top}
							x2={activePoint.x}
							y2={PAD.top + plotHeight}
							stroke="var(--color-camel)"
							strokeOpacity={0.35}
							strokeDasharray="3 5"
						/>
						<foreignObject
							x={Math.min(Math.max(activePoint.x - 72, PAD.left), CHART_WIDTH - PAD.right - 144)}
							y={Math.max(activePoint.y - 52, 4)}
							width={144}
							height={144}
						>
							<div className="rounded-lg border border-camel/20 bg-white/95 px-3 py-2 backdrop-blur-sm">
								<p className="text-[10px] uppercase tracking-[0.16em] text-[#1A1A1A]/45">{activePoint.bar.label}</p>
								<p className="font-serif text-lg leading-none text-camel-dark">{activePoint.bar.revenueFormatted}</p>
							</div>
						</foreignObject>
					</g>
				) : null}
			</svg>

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
