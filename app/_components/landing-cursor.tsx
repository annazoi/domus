'use client';

import { useEffect, useRef, useState } from 'react';

const INTERACTIVE = 'a, button, [role="button"], label, .pill, summary';
const TEXT_FIELDS = 'input, textarea, select, [contenteditable="true"]';

export function LandingCursor() {
	const dotRef = useRef<HTMLDivElement>(null);
	const pos = useRef({ x: -100, y: -100 });
	const target = useRef({ x: -100, y: -100 });
	const rafRef = useRef(0);
	const [active, setActive] = useState(false);
	const [visible, setVisible] = useState(false);
	const [hovering, setHovering] = useState(false);
	const [typing, setTyping] = useState(false);

	useEffect(() => {
		const finePointer = window.matchMedia('(pointer: fine)');
		const sync = () => setActive(finePointer.matches);
		sync();
		finePointer.addEventListener('change', sync);
		return () => finePointer.removeEventListener('change', sync);
	}, []);

	useEffect(() => {
		if (!active) return;

		const root = document.querySelector('.hozya-landing');
		root?.classList.add('has-custom-cursor');

		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
		let lerp = reduceMotion.matches ? 1 : 0.28;

		const onReduceChange = () => {
			lerp = reduceMotion.matches ? 1 : 0.28;
		};
		reduceMotion.addEventListener('change', onReduceChange);

		const onMove = (event: MouseEvent) => {
			target.current.x = event.clientX;
			target.current.y = event.clientY;
			setVisible(true);

			const under = document.elementFromPoint(event.clientX, event.clientY);
			if (!under) {
				setHovering(false);
				setTyping(false);
				return;
			}

			const inText = Boolean(under.closest(TEXT_FIELDS));
			setTyping(inText);
			setHovering(!inText && Boolean(under.closest(INTERACTIVE)));
		};

		const onLeave = () => {
			setVisible(false);
			setHovering(false);
			setTyping(false);
		};

		const tick = () => {
			pos.current.x += (target.current.x - pos.current.x) * lerp;
			pos.current.y += (target.current.y - pos.current.y) * lerp;
			const dot = dotRef.current;
			if (dot) {
				dot.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`;
			}
			rafRef.current = requestAnimationFrame(tick);
		};

		window.addEventListener('mousemove', onMove, { passive: true });
		document.documentElement.addEventListener('mouseleave', onLeave);
		rafRef.current = requestAnimationFrame(tick);

		return () => {
			root?.classList.remove('has-custom-cursor');
			window.removeEventListener('mousemove', onMove);
			document.documentElement.removeEventListener('mouseleave', onLeave);
			reduceMotion.removeEventListener('change', onReduceChange);
			cancelAnimationFrame(rafRef.current);
		};
	}, [active]);

	if (!active) return null;

	return (
		<div
			ref={dotRef}
			className={[
				'landing-cursor',
				visible && !typing ? 'landing-cursor--visible' : '',
				hovering ? 'landing-cursor--hover' : '',
			]
				.filter(Boolean)
				.join(' ')}
			aria-hidden
		/>
	);
}
