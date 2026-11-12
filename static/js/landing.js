(() => {
  'use strict';
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobile-menu');
  function closeMenu() {
    if (!menu || !menuButton) return;
    menu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  }
  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const next = menuButton.getAttribute('aria-expanded') !== 'true';
      menu.hidden = !next;
      menuButton.setAttribute('aria-expanded', String(next));
      menuButton.setAttribute('aria-label', next ? 'Close navigation' : 'Open navigation');
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    window.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 780) closeMenu(); });
  }

  // The preview is deliberately illustrative: these numbers are never connected to a real account.
  const examples = {
    current: {
      balance: '₹2,84,750', balanceTrend: '+8.2%', income: '₹82,400', expenses: '₹32,150',
      incomeBars: [64, 80, 71, 94, 77, 88], expenseBars: [41, 50, 35, 44, 36, 57]
    },
    previous: {
      balance: '₹2,62,980', balanceTrend: '+5.4%', income: '₹74,800', expenses: '₹29,660',
      incomeBars: [58, 72, 83, 76, 69, 80], expenseBars: [38, 48, 47, 31, 41, 53]
    }
  };
  const periodButtons = document.querySelectorAll('.period-tab');
  const bars = [...document.querySelectorAll('.chart-pair')];
  function updatePreview(period) {
    const data = examples[period];
    if (!data) return;
    for (const key of ['balance','balanceTrend','income','expenses']) {
      const el = document.querySelector('[data-metric="' + key + '"]');
      if (el) el.textContent = data[key];
    }
    bars.forEach((pair, i) => {
      const income = pair.querySelector('i');
      const expense = pair.querySelector('b');
      if (income) income.style.setProperty('--bar-h', data.incomeBars[i] + '%');
      if (expense) expense.style.setProperty('--bar-h', data.expenseBars[i] + '%');
    });
    periodButtons.forEach(button => {
      const active = button.dataset.period === period;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  periodButtons.forEach(button => button.addEventListener('click', () => updatePreview(button.dataset.period)));
})();