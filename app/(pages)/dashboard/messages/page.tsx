'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Plus, Send } from 'lucide-react';
import { Button, cn } from '@/components/ui';
import { useAuthStore } from '@/store/auth';
import { useConversations } from '@/features/messaging/hooks/use-conversations';
import { useMessages } from '@/features/messaging/hooks/use-messages';
import { useMessagingSocket } from '@/features/messaging/hooks/use-messaging-socket';
import type { MessageRow } from '@/features/messaging/interfaces/messaging.interface';
import { sendMessageRest } from '@/features/messaging/services/messaging.services';
import { NewConversationModal } from './_components/new-conversation-modal';

function initials(name: string) {
	return name
		.split(' ')
		.map((w) => w[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
}

function relativeTime(iso: string) {
	try {
		return formatDistanceToNow(new Date(iso), { addSuffix: false });
	} catch {
		return '';
	}
}

function MessagesContent() {
	const searchParams = useSearchParams();
	const conversationFromUrl = searchParams.get('conversation');
	const { data: conversations = [], isLoading: conversationsLoading } = useConversations();
	const [activeId, setActiveId] = useState<string | null>(conversationFromUrl);
	const [draft, setDraft] = useState('');
	const [socketMessages, setSocketMessages] = useState<MessageRow[]>([]);
	const [isNewOpen, setIsNewOpen] = useState(false);
	const userId = useAuthStore((state) => state.user_uuid);

	const activeConversationId = activeId ?? conversations[0]?.id ?? null;
	const { data: fetchedMessages, isLoading: messagesLoading } = useMessages(activeConversationId);

	useEffect(() => {
		if (conversationFromUrl) {
			setActiveId(conversationFromUrl);
			return;
		}
		if (!activeId && conversations[0]?.id) {
			setActiveId(conversations[0].id);
		}
	}, [activeId, conversationFromUrl, conversations]);

	useEffect(() => {
		setSocketMessages([]);
	}, [activeConversationId]);

	const displayMessages = useMemo(() => {
		const base = fetchedMessages ?? [];
		const ids = new Set(base.map((m) => m.id));
		const extras = socketMessages.filter((m) => !ids.has(m.id));
		return [...base, ...extras]
			.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
			.map((m) => ({
				...m,
				is_mine: userId ? m.sender_id === userId : false,
			}));
	}, [fetchedMessages, socketMessages, userId]);

	const onSocketMessage = useCallback((message: MessageRow) => {
		setSocketMessages((prev) => {
			if (prev.some((m) => m.id === message.id)) return prev;
			return [...prev, message];
		});
	}, []);

	const { send } = useMessagingSocket(activeConversationId, onSocketMessage);

	const active = useMemo(
		() => conversations.find((c) => c.id === activeConversationId) ?? null,
		[conversations, activeConversationId],
	);

	const sendMessage = async () => {
		const text = draft.trim();
		if (!text || !activeConversationId) return;

		const sentViaSocket = send(text);
		if (!sentViaSocket) {
			const message = await sendMessageRest(activeConversationId, text);
			setSocketMessages((prev) => [...prev, message]);
		}

		setDraft('');
	};

	return (
		<div className="space-y-6">
			<div className="flex min-h-[min(720px,calc(100vh-12rem))] flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm md:flex-row">
				<aside className="flex max-h-[40vh] shrink-0 flex-col border-b border-black/5 md:max-h-none md:w-[300px] md:border-b-0 md:border-r">
					<div className="flex items-center justify-between gap-2 border-b border-black/5 px-4 py-3">
						<span className="text-xs font-medium uppercase tracking-wide text-[#1A1A1A]/45">
							Conversations
						</span>
						<Button
							type="button"
							variant="ghostPill"
							onClick={() => setIsNewOpen(true)}
							className="h-8 gap-1 px-2 text-xs text-camel flex"
						>
							<Plus className="h-3.5 w-3.5" />
							<span className="hidden md:block">New</span>
						</Button>
					</div>
					<ul className="flex-1 overflow-y-auto">
						{conversationsLoading && (
							<li className="px-4 py-6 text-sm text-[#1A1A1A]/45">Loading…</li>
						)}
						{!conversationsLoading && conversations.length === 0 && (
							<li className="space-y-3 px-4 py-6 text-sm text-[#1A1A1A]/45">
								<p>No conversations yet.</p>
								<Button
									type="button"
									onClick={() => setIsNewOpen(true)}
									className="h-9 rounded-xl bg-camel px-3 text-xs text-white hover:bg-camel-dark"
								>
									Start by email
								</Button>
							</li>
						)}
						{conversations.map((c) => (
							<li key={c.id}>
								<button
									type="button"
									onClick={() => setActiveId(c.id)}
									className={cn(
										'flex w-full gap-3 border-b border-black/[0.03] px-4 py-3 text-left transition hover:bg-black/[0.02]',
										c.id === activeConversationId && 'bg-camel/8',
									)}
								>
									<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-camel/15 text-xs font-semibold text-camel">
										{initials(c.other_user_name)}
									</span>
									<span className="min-w-0 flex-1">
										<span className="flex items-baseline justify-between gap-2">
											<span className="truncate font-medium text-[#1A1A1A]">{c.other_user_name}</span>
											<span className="shrink-0 text-[10px] text-[#1A1A1A]/40">
												{relativeTime(c.updated_at)}
											</span>
										</span>
										<span className="line-clamp-1 text-xs text-[#1A1A1A]/50">
											{c.preview ?? 'No messages yet'}
										</span>
										<span className="mt-0.5 block truncate text-[10px] text-camel/80">
											{c.property_title}
										</span>
									</span>
								</button>
							</li>
						))}
					</ul>
				</aside>

				<section className="flex min-h-0 min-w-0 flex-1 flex-col">
					{!active ? (
						<div className="flex flex-1 items-center justify-center px-4 text-sm text-[#1A1A1A]/45">
							Select a conversation
						</div>
					) : (
						<>
							<header className="flex items-center gap-3 border-b border-black/5 px-4 py-3">
								<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-camel/15 text-[10px] font-semibold text-camel">
									{initials(active.other_user_name)}
								</span>
								<div className="min-w-0">
									<p className="truncate font-medium text-[#1A1A1A]">{active.other_user_name}</p>
									<p className="truncate text-xs text-[#1A1A1A]/50">{active.property_title}</p>
								</div>
							</header>

							<div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
								{messagesLoading && (
									<p className="text-center text-sm text-[#1A1A1A]/45">Loading messages…</p>
								)}
								{displayMessages.map((m) => (
									<div
										key={m.id}
										className={cn('flex', m.is_mine ? 'justify-end' : 'justify-start')}
									>
										<div
											className={cn(
												'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
												m.is_mine
													? 'rounded-br-md bg-camel text-white'
													: 'rounded-bl-md bg-black/[0.05] text-[#1A1A1A]',
											)}
										>
											{m.body}
										</div>
									</div>
								))}
							</div>

							<div className="border-t border-black/5 p-3">
								<div className="flex gap-2">
									<input
										value={draft}
										onChange={(e) => setDraft(e.target.value)}
										onKeyDown={(e) =>
											e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), void sendMessage())
										}
										placeholder="Type a message…"
										className="min-h-11 flex-1 rounded-xl border border-black/10 bg-[#fafafa] px-4 text-sm outline-none ring-camel placeholder:text-[#1A1A1A]/35 focus:border-camel/40 focus:ring-2"
									/>
									<Button
										type="button"
										onClick={() => void sendMessage()}
										className="h-11 shrink-0 rounded-xl bg-camel px-4 text-white hover:bg-camel-dark"
									>
										<Send className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</>
					)}
				</section>
			</div>

			<NewConversationModal
				open={isNewOpen}
				onClose={() => setIsNewOpen(false)}
				onCreated={(conversationId) => setActiveId(conversationId)}
			/>
		</div>
	);
}

export default function MessagesPage() {
	return (
		<Suspense fallback={<div className="py-12 text-sm text-[#1A1A1A]/45">Loading…</div>}>
			<MessagesContent />
		</Suspense>
	);
}
