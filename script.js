const header = document.querySelector('.header');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const navLinks = document.querySelectorAll('.nav a[href^="#"]');
const revealElements = document.querySelectorAll('.reveal');
const galleryFilters = document.querySelectorAll('[data-gallery-filter]');
const galleryPanels = document.querySelectorAll('[data-gallery-panel]');
const zoomableImages = document.querySelectorAll('main img');
const navTargets = Array.from(navLinks)
	.map((link) => ({
		link,
		target: document.querySelector(link.getAttribute('href'))
	}))
	.filter((item) => item.target);

function closeMenu() {
	if (!nav || !menuToggle) return;
	nav.classList.remove('open');
	menuToggle.setAttribute('aria-expanded', 'false');
}

function smoothScrollTo(targetId) {
	const target = document.querySelector(targetId);
	if (!target) return;

	const headerHeight = header ? header.offsetHeight : 0;
	const targetY = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;

	window.scrollTo({
		top: targetY,
		behavior: 'smooth'
	});
}

if (menuToggle && nav) {
	menuToggle.addEventListener('click', () => {
		const isOpen = nav.classList.toggle('open');
		menuToggle.setAttribute('aria-expanded', String(isOpen));
	});
}

navLinks.forEach((link) => {
	link.addEventListener('click', (event) => {
		const targetId = link.getAttribute('href');
		if (!targetId || !targetId.startsWith('#')) return;

		event.preventDefault();
		smoothScrollTo(targetId);
		closeMenu();
	});
});

window.addEventListener('resize', () => {
	if (window.innerWidth > 860) closeMenu();
});

document.addEventListener('click', (event) => {
	if (!nav || !menuToggle) return;
	const clickInsideNav = nav.contains(event.target);
	const clickOnToggle = menuToggle.contains(event.target);

	if (!clickInsideNav && !clickOnToggle) {
		closeMenu();
	}
});

const revealObserver = new IntersectionObserver(
	(entries, observer) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add('is-visible');
				observer.unobserve(entry.target);
			}
		});
	},
	{
		threshold: 0.16,
		rootMargin: '0px 0px -40px 0px'
	}
);

revealElements.forEach((element, index) => {
	element.style.transitionDelay = `${Math.min(index * 35, 240)}ms`;
	revealObserver.observe(element);
});

if (galleryFilters.length && galleryPanels.length) {
	galleryFilters.forEach((button) => {
		button.addEventListener('click', () => {
			const selected = button.getAttribute('data-gallery-filter');
			if (!selected) return;

			galleryFilters.forEach((item) => {
				const isActive = item === button;
				item.classList.toggle('is-active', isActive);
				item.setAttribute('aria-selected', String(isActive));
			});

			galleryPanels.forEach((panel) => {
				const isActivePanel = panel.getAttribute('data-gallery-panel') === selected;
				panel.hidden = !isActivePanel;
				panel.classList.toggle('is-active', isActivePanel);
			});
		});
	});
}

const partyCarousel = document.querySelector('[data-party-carousel]');
const partySlides = partyCarousel ? Array.from(partyCarousel.querySelectorAll('[data-party-slide]')) : [];
const partyPrevButton = partyCarousel ? partyCarousel.querySelector('[data-party-prev]') : null;
const partyNextButton = partyCarousel ? partyCarousel.querySelector('[data-party-next]') : null;

if (partyCarousel && partySlides.length > 1 && partyPrevButton && partyNextButton) {
	let currentSlide = partySlides.findIndex((slide) => slide.classList.contains('is-active'));
	let isAnimating = false;

	if (currentSlide < 0) currentSlide = 0;

	function clearSlideTransitionClasses(slide) {
		slide.classList.remove('is-entering-next', 'is-entering-prev', 'is-exiting-next', 'is-exiting-prev');
	}

	function showPartySlide(direction) {
		if (isAnimating) return;
		isAnimating = true;

		const previousSlide = partySlides[currentSlide];
		const nextIndex =
			direction === 'next'
				? (currentSlide + 1) % partySlides.length
				: (currentSlide - 1 + partySlides.length) % partySlides.length;
		const nextSlide = partySlides[nextIndex];

		partySlides.forEach((slide) => clearSlideTransitionClasses(slide));
		nextSlide.classList.remove('is-active');

		const enteringClass = direction === 'next' ? 'is-entering-next' : 'is-entering-prev';
		const exitingClass = direction === 'next' ? 'is-exiting-next' : 'is-exiting-prev';

		nextSlide.classList.add(enteringClass);
		window.requestAnimationFrame(() => {
			previousSlide.classList.add(exitingClass);
			nextSlide.classList.add('is-active');

			window.setTimeout(() => {
				previousSlide.classList.remove('is-active');
				clearSlideTransitionClasses(previousSlide);
				clearSlideTransitionClasses(nextSlide);
				currentSlide = nextIndex;
				isAnimating = false;
			}, 460);
		});
	}

	partyPrevButton.addEventListener('click', () => showPartySlide('prev'));
	partyNextButton.addEventListener('click', () => showPartySlide('next'));
}

if (zoomableImages.length) {
	const lightbox = document.createElement('div');
	lightbox.className = 'image-lightbox';
	lightbox.hidden = true;
	lightbox.setAttribute('aria-hidden', 'true');

	const lightboxImage = document.createElement('img');
	lightboxImage.className = 'image-lightbox-media';
	lightboxImage.alt = '';
	lightbox.appendChild(lightboxImage);
	document.body.appendChild(lightbox);

	function closeLightbox() {
		lightbox.classList.remove('open');
		lightbox.hidden = true;
		lightbox.setAttribute('aria-hidden', 'true');
		lightboxImage.src = '';
	}

	zoomableImages.forEach((image) => {
		image.classList.add('zoomable-image');
		image.addEventListener('click', () => {
			lightboxImage.src = image.currentSrc || image.src;
			lightboxImage.alt = image.alt || 'Imagem ampliada';
			lightbox.hidden = false;
			lightbox.classList.add('open');
			lightbox.setAttribute('aria-hidden', 'false');
		});
	});

	lightboxImage.addEventListener('click', closeLightbox);
	lightbox.addEventListener('click', (event) => {
		if (event.target === lightbox) closeLightbox();
	});

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && lightbox.classList.contains('open')) {
			closeLightbox();
		}
	});
}

function updateActiveNav() {
	if (!navTargets.length) return;

	const headerHeight = header ? header.offsetHeight : 0;
	const marker = window.scrollY + headerHeight + 140;
	let activeItem = navTargets[0];

	navTargets.forEach((item) => {
		if (marker >= item.target.offsetTop) {
			activeItem = item;
		}
	});

	navTargets.forEach((item) => {
		item.link.classList.toggle('active', item === activeItem);
	});
}

window.addEventListener('scroll', updateActiveNav, { passive: true });
window.addEventListener('load', updateActiveNav);
updateActiveNav();
