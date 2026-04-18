type SidebarItem = {
	id: string;
	label: string;
};

export const PROPERTY_FORM_TAB_IDS = [
	'basic-info',
	'capacity',
	'location',
	'pricing',
	'amenities',
	'images',
] as const;

export type PropertyFormTabId = (typeof PROPERTY_FORM_TAB_IDS)[number];

type PropertyFormSidebarProps = {
	mode: 'create' | 'edit';
	activeTab: PropertyFormTabId;
	onTabChange: (tabId: PropertyFormTabId) => void;
	onEditAvailability?: () => void;
};

const sidebarItems: SidebarItem[] = [
	{ id: 'basic-info', label: 'Basic info' },
	{ id: 'capacity', label: 'Capacity' },
	{ id: 'location', label: 'Location' },
	{ id: 'pricing', label: 'Pricing' },
	{ id: 'amenities', label: 'Amenities' },
	{ id: 'images', label: 'Images' },
];

export function PropertyFormSidebar({
	mode,
	activeTab,
	onTabChange,
	onEditAvailability,
}: PropertyFormSidebarProps) {
	return (
		<aside className="sticky top-24 space-y-4 rounded-2xl bg-white/80 p-5">
			<nav className="space-y-1" role="tablist" aria-label="Property form sections">
				{sidebarItems.map((item) => {
					const selected = activeTab === item.id;
					return (
						<button
							key={item.id}
							id={`property-form-tab-${item.id}`}
							type="button"
							role="tab"
							aria-selected={selected}
							onClick={() => onTabChange(item.id as PropertyFormTabId)}
							className={[
								'block w-full rounded-lg px-3 py-2 text-left text-sm transition',
								selected
									? 'bg-black/5 text-[#1A1A1A]'
									: 'text-[#1A1A1A]/70 hover:bg-black/5 hover:text-[#1A1A1A]',
							].join(' ')}
						>
							{item.label}
						</button>
					);
				})}
			</nav>

			{mode === 'edit' && onEditAvailability ? (
				<div className="pt-2">
					<button
						type="button"
						className="w-full rounded-full border border-black/10 px-5 py-2.5 text-sm"
						onClick={onEditAvailability}
					>
						Edit availability
					</button>
				</div>
			) : null}
		</aside>
	);
}
