// Simple tab-to-panel switcher for the main tabs
document.addEventListener('DOMContentLoaded', () => {
	const tabs = Array.from(document.querySelectorAll('.top-tabs [role="tab"]'));
	const panels = Array.from(document.querySelectorAll('.tab-panel'));

	// Position tabs below top bar, and panels below tabs
	function positionElements() {
		const topBar = document.querySelector('.top-bar');
		const topTabs = document.querySelector('.top-tabs');
		if (!topBar || !topTabs) return;

		// Position tabs right below the top bar
		const barRect = topBar.getBoundingClientRect();
		topTabs.style.top = Math.ceil(barRect.bottom) + 10 + 'px';

		// Position panels right below the tabs
		const tabsRect = topTabs.getBoundingClientRect();
		const topPx = Math.ceil(tabsRect.bottom);
		panels.forEach(p => {
			p.style.top = topPx + 'px';
		});
	}

	// update on load and when viewport changes
	window.addEventListener('resize', positionElements);
	window.addEventListener('orientationchange', positionElements);
	window.addEventListener('load', positionElements);

	function getRandomTurtleImage() {
		const turtles = ['turtl1.png', 'turtl2.png', 'turtl3.png'];
		return turtles[Math.floor(Math.random() * turtles.length)];
	}

	window.activateTab = function(id) {
		tabs.forEach(t => {
			const isActive = t.dataset.tab === id;
			t.setAttribute('aria-selected', String(Boolean(isActive)));
			if (isActive) t.classList.add('active'); else t.classList.remove('active');
		});

		panels.forEach(p => {
			const isActive = p.dataset.tabpanel === id;
			const pText = p.querySelector('p');
			if (isActive) {
				p.hidden = false;
				if (pText) {
					// Randomly select turtl1-2-3 image for specific tabs
					if (['intro', 'guidelines', 'staff'].includes(id)) {
						pText.style.backgroundImage = `url(images/${getRandomTurtleImage()})`;
					}
					pText.classList.add('fade-out');
					// Force reflow to trigger transition from opacity 0 to 1
					void pText.offsetWidth;
					pText.classList.remove('fade-out');
				}
			} else {
				// Add fade-out class to text content
				if (pText) {
					pText.classList.add('fade-out');
				}
				// Wait for fade-out animation to complete before hiding
				setTimeout(() => {
					p.hidden = true;
				}, 300); // Match the 0.5s transition duration
			}
		});
	};

	tabs.forEach(t => {
		t.addEventListener('click', (e) => {
			// only handle button tabs (external links are anchors)
			if (t.tagName !== 'BUTTON') return;
			const id = t.dataset.tab;
			if (!id) return;
			window.activateTab(id);
		});
	});

	// default: activate introduction if present
	const defaultTab = tabs.find(t => t.dataset.tab === 'intro');
	if (defaultTab) window.activateTab('intro');

	// position panels after initial render
	positionElements();
});