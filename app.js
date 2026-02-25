/* ═══════════════════════════════════════════════════════════════
   WARI Market — App Logic (Vanilla JS)
   SPA Flow: Landing → Login Modal → Dashboard
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initImpactCounters();
  initIncomeChart();
});

/* ─────────────────────────────────────────────
   HEADER — Scroll Shadow
   ───────────────────────────────────────────── */
function initHeaderScroll() {
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('header--scrolled', window.scrollY > 20);
  });
}

function scrollToTop(e) {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ─────────────────────────────────────────────
   MOBILE MENU
   ───────────────────────────────────────────── */
function toggleMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  hamburger.classList.toggle('active');
  menu.classList.toggle('active');
}

function closeMobileMenu() {
  document.getElementById('hamburger').classList.remove('active');
  document.getElementById('mobile-menu').classList.remove('active');
}

/* ─────────────────────────────────────────────
   MODALS — Login, Registro, Detalle
   ───────────────────────────────────────────── */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function closeModalOverlay(e) {
  // Cierra solo si se hace clic en el overlay (fondo oscuro)
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function switchModal(fromId, toId) {
  closeModal(fromId);
  setTimeout(() => openModal(toId), 200);
}

// Cerrar modal con tecla ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(modal => {
      modal.classList.remove('active');
    });
    document.body.style.overflow = '';
  }
});

/* ─────────────────────────────────────────────
   LOGIN — SPA Transition: Landing → Dashboard
   ───────────────────────────────────────────── */
function handleLogin(e) {
  e.preventDefault();

  // Cerrar modal
  document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
  document.body.style.overflow = '';

  // Ocultar Landing, mostrar Dashboard
  const landing = document.getElementById('landing-page');
  const dashboard = document.getElementById('dashboard-view');

  landing.style.display = 'none';
  dashboard.style.display = 'flex';

  // Scroll al inicio
  window.scrollTo({ top: 0 });

  // Inicializar gráfico del dashboard (si aún no existe)
  setTimeout(() => {
    initIncomeChart();
  }, 300);

  /*
   * 🔌 API CONNECTION POINT:
   * Aquí se conectaría la API de autenticación real.
   * Ejemplo con fetch:
   *
   * const response = await fetch('/api/auth/login', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ email, password })
   * });
   * const data = await response.json();
   * if (data.token) { localStorage.setItem('token', data.token); }
   */
}

function handleLogout() {
  const landing = document.getElementById('landing-page');
  const dashboard = document.getElementById('dashboard-view');

  dashboard.style.display = 'none';
  landing.style.display = 'block';

  // Cerrar sidebar mobile
  document.getElementById('sidebar').classList.remove('active');

  window.scrollTo({ top: 0 });

  /*
   * 🔌 API CONNECTION POINT:
   * Aquí se limpiaría el token de sesión:
   * localStorage.removeItem('token');
   * fetch('/api/auth/logout', { method: 'POST' });
   */
}

/* ─────────────────────────────────────────────
   DASHBOARD — Tab Navigation
   ───────────────────────────────────────────── */
function switchDashTab(el, tabId) {
  // Desactivar todos los tabs y links
  document.querySelectorAll('.dash-tab').forEach(tab => tab.style.display = 'none');
  document.querySelectorAll('.sidebar__link').forEach(link => link.classList.remove('sidebar__link--active'));

  // Activar el seleccionado
  const tab = document.getElementById(tabId);
  if (tab) tab.style.display = 'block';
  if (el) el.classList.add('sidebar__link--active');

  // Cerrar sidebar en mobile
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('active');
  }

  // Re-render chart si es overview
  if (tabId === 'dash-overview') {
    setTimeout(() => initIncomeChart(), 100);
  }
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
}

/* ─────────────────────────────────────────────
   IMPACT — Animated Counters
   ───────────────────────────────────────────── */
function initImpactCounters() {
  const cards = document.querySelectorAll('.impact__card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  cards.forEach(card => observer.observe(card));
}

function animateCounter(card) {
  const target = parseInt(card.dataset.count);
  const suffix = card.dataset.suffix || '';
  const numberEl = card.querySelector('.impact__number');
  const duration = 2000; // ms
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);

    numberEl.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/* ─────────────────────────────────────────────
   CATALOG — Product Filters
   ───────────────────────────────────────────── */
function filterProducts() {
  const origin  = document.getElementById('filter-origin').value;
  const color   = document.getElementById('filter-color').value;
  const quality = document.getElementById('filter-quality').value;

  const cards = document.querySelectorAll('.product-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const matchOrigin  = origin  === 'all' || card.dataset.origin  === origin;
    const matchColor   = color   === 'all' || card.dataset.color   === color;
    const matchQuality = quality === 'all' || card.dataset.quality === quality;

    if (matchOrigin && matchColor && matchQuality) {
      card.classList.remove('hidden');
      visibleCount++;
    } else {
      card.classList.add('hidden');
    }
  });

  // Mostrar/ocultar mensaje vacío
  document.getElementById('catalog-empty').style.display = visibleCount === 0 ? 'block' : 'none';

  /*
   * 🔌 API CONNECTION POINT:
   * En producción, los filtros harían un request al backend:
   *
   * const params = new URLSearchParams({ origin, color, quality });
   * const response = await fetch(`/api/products?${params}`);
   * const products = await response.json();
   * renderProducts(products);
   */
}

function resetFilters() {
  document.getElementById('filter-origin').value  = 'all';
  document.getElementById('filter-color').value   = 'all';
  document.getElementById('filter-quality').value = 'all';

  document.querySelectorAll('.product-card').forEach(card => {
    card.classList.remove('hidden');
  });
  document.getElementById('catalog-empty').style.display = 'none';
}

/* ─────────────────────────────────────────────
   MAP — Interactive Tooltip
   ───────────────────────────────────────────── */
function showMapTooltip(el, region, ha, productores) {
  const tooltip = document.getElementById('map-tooltip');
  document.getElementById('tooltip-region').textContent = region;
  document.getElementById('tooltip-ha').textContent = ha;
  document.getElementById('tooltip-prod').textContent = productores;

  tooltip.style.display = 'block';

  // Highlight selected point
  document.querySelectorAll('.map-point').forEach(p => {
    p.querySelector('.map-point__dot').style.fill = '';
  });
  el.querySelector('.map-point__dot').style.fill = 'var(--clr-green-dark)';

  /*
   * 🔌 API CONNECTION POINT:
   * En producción, se cargarían datos reales del mapa:
   *
   * const response = await fetch(`/api/regions/${regionId}`);
   * const data = await response.json();
   * // Renderizar marcadores con Leaflet.js / Mapbox
   * L.marker([data.lat, data.lng]).addTo(map);
   */
}

/* ─────────────────────────────────────────────
   MAP — Zoom & Pan Controls
   ───────────────────────────────────────────── */
(function initMapZoom() {
  const wrapper = document.getElementById('map-zoom-wrapper');
  const canvas  = document.getElementById('map-canvas');
  const btnIn   = document.getElementById('map-zoom-in');
  const btnOut  = document.getElementById('map-zoom-out');
  const btnReset= document.getElementById('map-zoom-reset');

  if (!wrapper || !canvas) return;

  let scale = 1;
  let panX = 0, panY = 0;
  let isDragging = false;
  let startX, startY;
  const MIN_SCALE = 1;
  const MAX_SCALE = 4;
  const STEP = 0.5;

  function applyTransform(smooth) {
    wrapper.style.transition = smooth ? 'transform 0.3s ease' : 'none';
    wrapper.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    wrapper.classList.toggle('is-zoomed', scale > 1);
  }

  function clampPan() {
    if (scale <= 1) { panX = 0; panY = 0; return; }
    const rect = canvas.getBoundingClientRect();
    const maxPanX = (rect.width  * (scale - 1)) / 2;
    const maxPanY = (rect.height * (scale - 1)) / 2;
    panX = Math.max(-maxPanX, Math.min(maxPanX, panX));
    panY = Math.max(-maxPanY, Math.min(maxPanY, panY));
  }

  btnIn.addEventListener('click', () => {
    scale = Math.min(MAX_SCALE, scale + STEP);
    clampPan();
    applyTransform(true);
  });

  btnOut.addEventListener('click', () => {
    scale = Math.max(MIN_SCALE, scale - STEP);
    clampPan();
    applyTransform(true);
  });

  btnReset.addEventListener('click', () => {
    scale = 1; panX = 0; panY = 0;
    applyTransform(true);
  });

  // Mouse wheel zoom
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -STEP : STEP;
    scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta));
    clampPan();
    applyTransform(true);
  }, { passive: false });

  // Drag to pan
  wrapper.addEventListener('mousedown', (e) => {
    if (scale <= 1) return;
    isDragging = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
    wrapper.classList.add('is-dragging');
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    clampPan();
    applyTransform(false);
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    wrapper.classList.remove('is-dragging');
  });

  // Touch support
  let lastTouchDist = 0;
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      lastTouchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    } else if (e.touches.length === 1 && scale > 1) {
      isDragging = true;
      startX = e.touches[0].clientX - panX;
      startY = e.touches[0].clientY - panY;
      wrapper.classList.add('is-dragging');
    }
  }, { passive: true });

  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = (dist - lastTouchDist) * 0.01;
      scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta));
      lastTouchDist = dist;
      clampPan();
      applyTransform(false);
    } else if (isDragging && e.touches.length === 1) {
      e.preventDefault();
      panX = e.touches[0].clientX - startX;
      panY = e.touches[0].clientY - startY;
      clampPan();
      applyTransform(false);
    }
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    isDragging = false;
    wrapper.classList.remove('is-dragging');
    lastTouchDist = 0;
  });
})();

/* ─────────────────────────────────────────────
   SIMULATOR — Yield & Market Calculation
   ───────────────────────────────────────────── */
function runSimulator(e) {
  e.preventDefault();

  // Obtener inputs — soporta ambos formularios (landing y dashboard)
  const form = e.target;
  const hectaresInput = form.querySelector('input[type="number"]');
  const varietySelect = form.querySelector('select');
  const hectares = parseFloat(hectaresInput.value);

  if (!hectares || hectares <= 0) return;

  const variety = varietySelect.value;

  // Mock data de rendimiento por variedad (kg/ha)
  const yieldPerHa = {
    pardo: 420,
    crema: 380,
    fifo:  350
  };

  // Mock precios por variedad (S/ / kg)
  const pricePerKg = {
    pardo: 28,
    crema: 32,
    fifo:  24
  };

  // Mercado potencial (marcas interesadas según volumen)
  const marketBrands = hectares >= 5 ? '8-12 marcas' :
                       hectares >= 2 ? '3-6 marcas' :
                                       '1-3 marcas';

  const totalYield  = (yieldPerHa[variety] * hectares).toFixed(0);
  const totalIncome = (totalYield * pricePerKg[variety]).toLocaleString('es-PE');

  // Detectar si es el formulario del landing o del dashboard
  const resultsContainer = form.closest('.simulator').querySelector('.simulator__results');
  const isLanding = form.closest('#simulador') !== null || form.closest('.tools-section') !== null;

  // Mostrar resultados
  resultsContainer.style.display = 'grid';

  const yieldEl  = resultsContainer.querySelector('[id$="yield"]');
  const incomeEl = resultsContainer.querySelector('[id$="income"]');
  const marketEl = resultsContainer.querySelector('[id$="market"]');

  // Animación suave
  resultsContainer.style.opacity = '0';
  requestAnimationFrame(() => {
    yieldEl.textContent  = `${totalYield} kg`;
    incomeEl.textContent = `S/ ${totalIncome}`;
    marketEl.textContent = marketBrands;
    resultsContainer.style.transition = 'opacity 0.4s ease';
    resultsContainer.style.opacity = '1';
  });

  /*
   * 🔌 API CONNECTION POINT:
   * En producción, el cálculo vendría del backend con modelos predictivos:
   *
   * const response = await fetch('/api/simulator/calculate', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ hectares, variety, region })
   * });
   * const prediction = await response.json();
   */
}

/* ─────────────────────────────────────────────
   CHART.JS — Income Chart (Dashboard)
   ───────────────────────────────────────────── */
let incomeChartInstance = null;

function initIncomeChart() {
  const canvas = document.getElementById('incomeChart');
  if (!canvas) return;

  // Evitar duplicados
  if (incomeChartInstance) {
    incomeChartInstance.destroy();
    incomeChartInstance = null;
  }

  // Verificar que el canvas es visible
  if (canvas.offsetParent === null) return;

  const ctx = canvas.getContext('2d');

  // Gradiente
  const gradient = ctx.createLinearGradient(0, 0, 0, 220);
  gradient.addColorStop(0, 'rgba(194, 113, 79, 0.3)');
  gradient.addColorStop(1, 'rgba(194, 113, 79, 0.01)');

  incomeChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [{
        label: 'Ingresos (S/)',
        data: [2200, 3800, 2900, 4100, 5400, 6200],
        borderColor: '#C2714F',
        backgroundColor: gradient,
        borderWidth: 2.5,
        pointBackgroundColor: '#C2714F',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 0 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#2C2C2C',
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: (ctx) => `S/ ${ctx.parsed.y.toLocaleString('es-PE')}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: 'Poppins', size: 12 },
            color: '#6B6B6B'
          }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: {
            font: { family: 'Poppins', size: 11 },
            color: '#6B6B6B',
            callback: (val) => `S/ ${val / 1000}k`
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  });

  /*
   * 🔌 API CONNECTION POINT:
   * En producción, los datos del chart vendrían del backend:
   *
   * const response = await fetch('/api/dashboard/income-chart', {
   *   headers: { 'Authorization': `Bearer ${token}` }
   * });
   * const chartData = await response.json();
   * incomeChartInstance.data.labels = chartData.labels;
   * incomeChartInstance.data.datasets[0].data = chartData.values;
   * incomeChartInstance.update();
   */
}

/* ─────────────────────────────────────────────
   SMOOTH SCROLL — Ajuste por header fijo
   ───────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});

/* ─────────────────────────────────────────────
   SCROLL REVEAL — Animaciones al aparecer
   ───────────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

// Aplicar animación de entrada a secciones y tarjetas
document.querySelectorAll('.impact__card, .product-card, .map-widget, .simulator, .cta-box, .traza-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  revealObserver.observe(el);
});
