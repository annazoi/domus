'use client';

import { useMemo, useState } from 'react';
import { Send } from 'lucide-react';
import { Button, cn } from '@/components/ui';

type DemoMsg = { id: string; text: string; side: 'host' | 'guest' };

type DemoChat = {
	id: string;
	name: string;
	property: string;
	preview: string;
	time: string;
	messages: DemoMsg[];
};

const DEMO: DemoChat[] = [
	{
		id: '1',
		name: 'Marco Rossi',
		property: 'Seaside loft',
		preview: 'Perfect, see you then.',
		time: '2m',
		messages: [
			{ id: 'a', side: 'guest', text: 'Hi - is late checkout possible on Sunday?' },
			{ id: 'b', side: 'host', text: 'Hi Marco. We can do 12pm if that works.' },
			{ id: 'c', side: 'guest', text: 'Perfect, see you then.' },
		],
	},
	{
		id: '2',
		name: 'Elena Voss',
		property: 'Cliffside retreat',
		preview: 'What time is check-in?',
		time: '1h',
		messages: [
			{ id: 'd', side: 'guest', text: 'What time is check-in?' },
			{ id: 'e', side: 'host', text: 'Check-in is from 4pm. I’ll send the code the morning of arrival.' },
		],
	},
	{
		id: '3',
		name: 'James Park',
		property: 'Urban studio',
		preview: 'Thanks for the quick reply.',
		time: 'Yesterday',
		messages: [{ id: 'f', side: 'guest', text: 'Thanks for the quick reply.' }],
	},
];

export default function MessagesPage() {
	const [activeId, setActiveId] = useState(DEMO[0].id);
	const [draft, setDraft] = useState('');
	const [threads, setThreads] = useState(() =>
		Object.fromEntries(DEMO.map((c) => [c.id, c.messages])) as Record<string, DemoMsg[]>,
	);

	const active = useMemo(() => DEMO.find((c) => c.id === activeId) ?? DEMO[0], [activeId]);

	const send = () => {
		const t = draft.trim();
		if (!t) return;
		const msg: DemoMsg = { id: `${Date.now()}`, side: 'host', text: t };
		setThreads((prev) => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), msg] }));
		setDraft('');
	};

	return (
		<div className="space-y-6">
			<div className="flex min-h-[min(720px,calc(100vh-12rem))] flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm md:flex-row">
				<aside className="flex max-h-[40vh] shrink-0 flex-col border-b border-black/5 md:max-h-none md:w-[300px] md:border-b-0 md:border-r">
					<div className="border-b border-black/5 px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#1A1A1A]/45">
						Conversations
					</div>
					<ul className="flex-1 overflow-y-auto">
						{DEMO.map((c) => (
							<li key={c.id}>
								<button
									type="button"
									onClick={() => setActiveId(c.id)}
									className={cn(
										'flex w-full gap-3 border-b border-black/[0.03] px-4 py-3 text-left transition hover:bg-black/[0.02]',
										c.id === activeId && 'bg-camel/8',
									)}
								>
									<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-camel/15 text-xs font-semibold text-camel">
										{c.name
											.split(' ')
											.map((w) => w[0])
											.join('')
											.slice(0, 2)}
									</span>
									<span className="min-w-0 flex-1">
										<span className="flex items-baseline justify-between gap-2">
											<span className="truncate font-medium text-[#1A1A1A]">{c.name}</span>
											<span className="shrink-0 text-[10px] text-[#1A1A1A]/40">{c.time}</span>
										</span>
										<span className="line-clamp-1 text-xs text-[#1A1A1A]/50">{c.preview}</span>
										<span className="mt-0.5 block truncate text-[10px] text-camel/80">{c.property}</span>
									</span>
								</button>
							</li>
						))}
					</ul>
				</aside>

				<section className="flex min-h-0 min-w-0 flex-1 flex-col">
					<header className="flex items-center gap-3 border-b border-black/5 px-4 py-3">
						<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-camel/15 text-[10px] font-semibold text-camel">
							{active.name
								.split(' ')
								.map((w) => w[0])
								.join('')
								.slice(0, 2)}
						</span>
						<div className="min-w-0">
							<p className="truncate font-medium text-[#1A1A1A]">{active.name}</p>
							<p className="truncate text-xs text-[#1A1A1A]/50">{active.property}</p>
						</div>
					</header>

					<div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
						{(threads[activeId] ?? []).map((m) => (
							<div
								key={m.id}
								className={cn('flex', m.side === 'host' ? 'justify-end' : 'justify-start')}
							>
								<div
									className={cn(
										'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
										m.side === 'host'
											? 'rounded-br-md bg-camel text-white'
											: 'rounded-bl-md bg-black/[0.05] text-[#1A1A1A]',
									)}
								>
									{m.text}
								</div>
							</div>
						))}
					</div>

					<div className="border-t border-black/5 p-3">
						<div className="flex gap-2">
							<input
								value={draft}
								onChange={(e) => setDraft(e.target.value)}
								onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
								placeholder="Type a message…"
								className="min-h-11 flex-1 rounded-xl border border-black/10 bg-[#fafafa] px-4 text-sm outline-none ring-camel placeholder:text-[#1A1A1A]/35 focus:border-camel/40 focus:ring-2"
							/>
							<Button
								type="button"
								onClick={send}
								className="h-11 shrink-0 rounded-xl bg-camel px-4 text-white hover:bg-camel-dark"
							>
								<Send className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
