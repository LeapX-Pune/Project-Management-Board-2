/**
 * Animations Module — Project Management Board
 * Handles scroll-triggered animations, data updates, and interaction feedback
 */

// ═══════════════════════════════════════════════════════════════
// Scroll-Triggered Animations (Intersection Observer)
// ═══════════════════════════════════════════════════════════════

const scrollObserverOptions = {
  root: null,
  rootMargin: '0px 0px -50px 0px',
  threshold: 0.1
};

const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      scrollObserver.unobserve(entry.target);
    }
  });
}, scrollObserverOptions);

/**
 * Initialize scroll-triggered animations
 */
export function initScrollAnimations() {
  // Observe fade-up elements
  document.querySelectorAll('.fade-up').forEach(el => {
    scrollObserver.observe(el);
  });

  // Observe stagger items
  document.querySelectorAll('.stagger-item').forEach(el => {
    scrollObserver.observe(el);
  });
}

/**
 * Add fade-up class to elements for scroll animation
 */
export function addScrollAnimation(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach(el => {
    el.classList.add('fade-up');
    scrollObserver.observe(el);
  });
}

// ═══════════════════════════════════════════════════════════════
// Data Update Animations (Number Count-up)
// ═══════════════════════════════════════════════════════════════

/**
 * Animate number from old value to new value
 * @param {HTMLElement} element - The element to animate
 * @param {number} start - Starting value
 * @param {number} end - Ending value
 * @param {number} duration - Animation duration in ms
 * @param {string} suffix - Optional suffix (e.g., '%', 'px')
 */
export function animateCount(element, start, end, duration = 600, suffix = '') {
  if (!element) return;

  const startTime = performance.now();
  const diff = end - start;

  element.classList.add('updating');

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing: ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + diff * eased);

    element.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.classList.remove('updating');
    }
  }

  requestAnimationFrame(update);
}

/**
 * Animate percentage ring
 * @param {SVGCircleElement} circle - The circle element
 * @param {number} percentage - Target percentage (0-100)
 */
export function animatePercentageRing(circle, percentage) {
  if (!circle) return;

  const radius = circle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = offset;
}

// ═══════════════════════════════════════════════════════════════
// Drag-and-Drop Feedback
// ═══════════════════════════════════════════════════════════════

/**
 * Add drop settle animation to card
 * @param {HTMLElement} card - The card element
 */
export function animateCardDrop(card) {
  if (!card) return;

  card.classList.add('just-dropped');
  setTimeout(() => {
    card.classList.remove('just-dropped');
  }, 300);
}

/**
 * Animate column count badge
 * @param {HTMLElement} badge - The count badge element
 */
export function animateCountBadge(badge) {
  if (!badge) return;

  badge.classList.add('bounce');
  setTimeout(() => {
    badge.classList.remove('bounce');
  }, 300);
}

/**
 * Create drop placeholder element
 * @returns {HTMLElement} The placeholder element
 */
export function createDropPlaceholder() {
  const placeholder = document.createElement('div');
  placeholder.classList.add('drag-placeholder');
  return placeholder;
}

// ═══════════════════════════════════════════════════════════════
// Button Ripple Effect
// ═══════════════════════════════════════════════════════════════

/**
 * Initialize ripple effect on buttons
 */
export function initRippleEffect() {
  document.addEventListener('click', (e) => {
    const button = e.target.closest('.btn, .btn-icon, .view-btn');
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    button.style.setProperty('--ripple-x', `${x}%`);
    button.style.setProperty('--ripple-y', `${y}%`);
  });
}

// ═══════════════════════════════════════════════════════════════
// View Transition Animations
// ═══════════════════════════════════════════════════════════════

/**
 * Animate view transition with staggered columns
 */
export function animateViewTransition() {
  const columns = document.querySelectorAll('.column');
  columns.forEach((col, index) => {
    col.style.setProperty('--col-index', index);
  });
}

// ═══════════════════════════════════════════════════════════════
// Activity Log Infinite Scroll Fade-in
// ═══════════════════════════════════════════════════════════════

/**
 * Add fade-in animation to new activity entries
 * @param {HTMLElement} container - The activity list container
 */
export function animateNewActivityEntries(container) {
  if (!container) return;

  const entries = container.querySelectorAll('.activity-entry:not(.animated)');
  entries.forEach((entry, index) => {
    entry.classList.add('animated');
    entry.style.animationDelay = `${index * 60}ms`;
    entry.classList.add('fade-in-up');
  });
}

// ═══════════════════════════════════════════════════════════════
// Initialize All Animations
// ═══════════════════════════════════════════════════════════════

/**
 * Initialize all animation systems
 */
export function initAnimations() {
  initScrollAnimations();
  initRippleEffect();
  animateViewTransition();

  // Observe activity list for new entries
  const activityList = document.getElementById('activity-list');
  if (activityList) {
    const activityObserver = new MutationObserver(() => {
      animateNewActivityEntries(activityList);
    });
    activityObserver.observe(activityList, { childList: true });
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations);
} else {
  initAnimations();
}
