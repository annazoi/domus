'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { Button, cn } from '@/components/ui';
import { useProperties } from '@/features/property/hooks/use-property';
import { useCreateConversation } from '@/features/messaging/hooks/use-conversations';
import { useSearchUsers } from '@/features/messaging/hooks/use-search-users';
import type { UserSearchResult } from '@/features/messaging/interfaces/messaging.interface';

function displayName(user: UserSearchResult) {
	return `${user.first_name} ${user.last_name}`.trim() || user.email;
}

export function NewConversationModal({
	open,
	onClose,
	onCreated,
}: {
	open: boolean;
	onClose: () => void;
	onCreated: (conversationId: string) => void;
}) {
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
	const [propertyId, setPropertyId] = useState('');
	const [error, setError] = useState('');

	const { data: myProperties = [] } = useProperties();
	const createConversation = useCreateConversation();
	const searchEnabled = open && searchQuery.trim().length >= 3;
	const { data: searchResults = [], isFetching: isSearching } = useSearchUsers(
		searchQuery,
		searchEnabled,
	);

	useEffect(() => {
		if (!open) {
			setSearchQuery('');
			setSelectedUser(null);
			setPropertyId('');
			setError('');
		}
	}, [open]);

	useEffect(() => {
		setSelectedUser(null);
		setPropertyId('');
	}, [searchQuery]);

	const propertyOptions = useMemo(() => {
		if (myProperties.length > 0) {
			return myProperties.map((p) => ({ id: p.id, title: p.title }));
		}
		return selectedUser?.properties ?? [];
	}, [myProperties, selectedUser]);

	useEffect(() => {
		if (propertyOptions.length === 1) {
			setPropertyId(propertyOptions[0].id);
		}
	}, [propertyOptions]);

	const handleStart = () => {
		if (!selectedUser) {
			setError('Pick a user from search results.');
			return;
		}
		if (!propertyId) {
			setError('Pick a property for this conversation.');
			return;
		}

		setError('');
		const input =
			myProperties.length > 0
				? { property_id: propertyId, guest_user_id: selectedUser.id }
				: { property_id: propertyId, host_user_id: selectedUser.id };

		createConversation.mutate(input, {
			onSuccess: (conversation) => {
				onCreated(conversation.id);
				onClose();
			},
			onError: () => setError('Could not start conversation. Try again.'),
		});
	};

	return (
		<AnimatePresence>
			{open ? (
				<motion.div
					className="fixed inset-0 z-[80] flex items-center justify-center p-4"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					<div className="absolute inset-0 bg-black/45" aria-hidden />
					<motion.div
						role="dialog"
						aria-modal
						aria-labelledby="new-conversation-title"
						className="relative z-10 w-full max-w-md rounded-2xl border border-dashboard-border/70 bg-dashboard-inset p-5 shadow-xl"
						initial={{ opacity: 0, scale: 0.96, y: 8 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.96, y: 8 }}
					>
						<div className="flex items-start justify-between gap-3">
							<div>
								<p className="text-xs uppercase tracking-[0.2em] text-camel">Messages</p>
								<h3 id="new-conversation-title" className="mt-1 font-serif text-2xl tracking-tight">
									New conversation
								</h3>
							</div>
							<Button type="button" variant="ghostPill" className="p-2" onClick={onClose} aria-label="Close">
								<X className="h-5 w-5" />
							</Button>
						</div>

						<div className="mt-5 space-y-4">
							<div>
								<label htmlFor="user-search" className="text-xs font-medium uppercase tracking-wide text-espresso/45">
									Find user by email or name
								</label>
								<input
									id="user-search"
									type="search"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="email or name"
									className="mt-1.5 min-h-11 w-full rounded-xl border border-black/10 bg-[#fafafa] px-4 text-sm outline-none focus:border-camel/40 focus:ring-2 focus:ring-camel/20"
								/>
							</div>

							{searchQuery.trim().length >= 3 ? (
								<div className="max-h-40 overflow-y-auto rounded-xl border border-black/5">
									{isSearching ? (
										<p className="flex items-center gap-2 px-4 py-3 text-sm text-espresso/45">
											<Loader2 className="h-4 w-4 animate-spin" />
											Searching…
										</p>
									) : null}
									{!isSearching && searchResults.length === 0 ? (
										<p className="px-4 py-3 text-sm text-espresso/45">No users found.</p>
									) : null}
									{searchResults.map((user) => (
										<button
											key={user.id}
											type="button"
											onClick={() => {
												setSelectedUser(user);
												setPropertyId('');
											}}
											className={cn(
												'flex w-full flex-col gap-0.5 border-b border-dashboard-border px-4 py-3 text-left last:border-b-0 hover:bg-dashboard-row-hover',
												selectedUser?.id === user.id && 'bg-camel/8',
											)}
										>
											<span className="font-medium text-espresso">{user.email}</span>
											<span className="text-xs text-espresso/50">{displayName(user)}</span>
										</button>
									))}
								</div>
							) : (
								<p className="text-xs text-espresso/45">Type at least 3 characters to search.</p>
							)}

							{selectedUser ? (
								<div>
									<label htmlFor="conversation-property" className="text-xs font-medium uppercase tracking-wide text-espresso/45">
										Property
									</label>
									{propertyOptions.length === 0 ? (
										<p className="mt-1.5 text-sm text-espresso/45">
											{myProperties.length > 0
												? 'You need at least one property.'
												: 'This host has no published properties to message about.'}
										</p>
									) : (
										<select
											id="conversation-property"
											value={propertyId}
											onChange={(e) => setPropertyId(e.target.value)}
											className="mt-1.5 min-h-11 w-full rounded-xl border border-black/10 bg-[#fafafa] px-4 text-sm outline-none focus:border-camel/40 focus:ring-2 focus:ring-camel/20"
										>
											<option value="">Select property…</option>
											{propertyOptions.map((p) => (
												<option key={p.id} value={p.id}>
													{p.title}
												</option>
											))}
										</select>
									)}
								</div>
							) : null}

							{error ? <p className="text-sm text-red-600">{error}</p> : null}
						</div>

						<div className="mt-6 flex justify-end gap-2">
							<Button type="button" variant="ghostPill" onClick={onClose}>
								Cancel
							</Button>
							<Button
								type="button"
								onClick={handleStart}
								disabled={createConversation.isPending || !selectedUser || !propertyId}
								className="rounded-xl bg-camel px-4 text-white hover:bg-camel-dark disabled:opacity-50"
							>
								{createConversation.isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Starting…
									</>
								) : (
									'Start chat'
								)}
							</Button>
						</div>
					</motion.div>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
