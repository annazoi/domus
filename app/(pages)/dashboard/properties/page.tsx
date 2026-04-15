const properties = [
	{ name: 'Villa Azure', location: 'Amalfi Coast, Italy', status: 'Active' },
	{ name: 'Maison Cedre', location: 'Provence, France', status: 'Active' },
	{ name: 'Ridge House', location: 'Aspen, USA', status: 'Draft' },
];

export default function PropertiesPage() {
	return (
		<div className="space-y-10">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p className="text-xs uppercase tracking-[0.2em] text-[#6B705C]">Properties</p>
					<h1 className="mt-2 font-serif text-4xl tracking-tight">Your homes, curated.</h1>
				</div>
				<button
					type="button"
					className="rounded-full bg-[#1A1A1A] px-5 py-2.5 text-sm text-white transition hover:-translate-y-0.5 hover:bg-[#1A1A1A]/90"
				>
					Add Property
				</button>
			</div>

			<div className="space-y-4">
				{properties.map((property) => (
					<div key={property.name} className="grid grid-cols-1 gap-4 rounded-2xl bg-white/80 p-4 md:grid-cols-[110px_1fr_auto]">
						<div className="h-24 rounded-xl bg-gradient-to-br from-[#6B705C]/30 to-[#6B705C]/10" />
						<div className="py-1">
							<p className="font-medium">{property.name}</p>
							<p className="text-sm text-[#1A1A1A]/55">{property.location}</p>
						</div>
						<div className="flex items-center gap-2 md:justify-end">
							<span className="rounded-full bg-black/5 px-3 py-1 text-xs">{property.status}</span>
							<button type="button" className="text-sm text-[#1A1A1A]/70 hover:text-[#6B705C]">
								Edit
							</button>
							<button type="button" className="text-sm text-[#1A1A1A]/70 hover:text-[#6B705C]">
								View
							</button>
							<button type="button" className="text-sm text-[#1A1A1A]/70 hover:text-[#6B705C]">
								Delete
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
