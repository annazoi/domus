import { Button } from '@/components/ui';
import { sidebarItems } from './constants';



export const PROPERTY_FORM_TAB_IDS = [
	'basic-info',
	'house-rules',
	'description',
	'capacity',
	'location',
	'pricing-availability',
	'amenities',
	'services',
	'images',
	'branding',
] as const;

export type PropertyFormTabId = (typeof PROPERTY_FORM_TAB_IDS)[number];

type PropertyFormSidebarProps = {
	mode: 'create' | 'edit';
	activeTab: PropertyFormTabId;
	onTabChange: (tabId: PropertyFormTabId) => void;
	onEditAvailability?: () => void;
};


export function PropertyFormSidebar({
	mode,
	activeTab,
	onTabChange,
	onEditAvailability,
}: PropertyFormSidebarProps) {
	return (
		<aside className="sticky top-24 space-y-4 dashboard-panel rounded-2xl p-5">
			<nav className="space-y-1" role="tablist" aria-label="Property form sections">
				{sidebarItems.map((item) => {
					const selected = activeTab === item.id;
					return (
						<Button
							key={item.id}
							id={`property-form-tab-${item.id}`}
							type="button"
							role="tab"
							aria-selected={selected}
							variant={selected ? 'tabActive' : 'tab'}
							onClick={() => onTabChange(item.id as PropertyFormTabId)}
						>
							{item.label}
						</Button>
					);
				})}
			</nav>

	
		</aside>
	);
}
