// Navigation enhancement only. The full site works without JavaScript.
const sectionLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
const sections = sectionLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);

if ('IntersectionObserver' in window && sections.length) {
  const visible = new Set();
  const updateNavigation = () => {
    const current = sections.find((section) => visible.has(section.id));
    for (const link of sectionLinks) {
      if (current && link.getAttribute('href') === `#${current.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target.id);
      else visible.delete(entry.target.id);
    }
    updateNavigation();
  }, { rootMargin: '-15% 0px -25% 0px' });
  sections.forEach((section) => observer.observe(section));
}
