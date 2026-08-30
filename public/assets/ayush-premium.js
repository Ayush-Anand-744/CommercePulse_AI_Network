
// Ayush Premium Revamp Layer - non-invasive UI badge
(function() {
  if (typeof document === 'undefined' || document.querySelector('.ayush-premium-badge')) return;
  const badge = document.createElement('div');
  badge.className = 'ayush-premium-badge';
  badge.textContent = 'CommercePulse_AI_Network';
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(badge));
})();
