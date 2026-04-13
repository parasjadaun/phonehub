// ============================================
// PHONE HUB STORE — APP LOGIC
// ============================================

// ---- State ----
let products = [];
let filteredProducts = [];
let currentSort = '';
let priceMax = 150000;
let activeCategoryFilter = '';
const ADMIN_PASSWORD = '123456';

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  renderHome();
  renderBrandFilters();
  renderStorageFilters();
  renderAdminProducts();
  applyFilters();
});

// ---- Storage ----
function loadProducts() {
  const saved = localStorage.getItem('phs_products');
  if (saved) {
    products = JSON.parse(saved).map(p => ({
      ...p,
      addedDate: new Date(p.addedDate)
    }));
  } else {
    products = SAMPLE_PRODUCTS.map(p => ({ ...p }));
    saveProducts();
  }
}

function saveProducts() {
  localStorage.setItem('phs_products', JSON.stringify(products));
}

// ---- Navigation ----
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const navEl = document.getElementById('nav-' + name);
  if (navEl) navEl.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (name === 'listing') {
    applyFilters();
  }
  if (name === 'admin') {
    renderAdminProducts();
  }
}

// ---- Theme ----
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('themeBtn').textContent = isDark ? '🌙' : '☀️';
}

// ---- WhatsApp ----
function openWhatsApp(phoneName) {
  const msg = encodeURIComponent(`Hi, I'm interested in ${phoneName}, is it available?`);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
}

// ---- Home Render ----
function renderHome() {
  // Hot Deals
  const hotDeals = products.filter(p => p.hotDeal && p.available);
  document.getElementById('hotDealsRow').innerHTML = hotDeals.length
    ? hotDeals.map(p => productCardHTML(p)).join('')
    : '<p style="color:var(--text-muted);font-size:13px;padding:8px">No hot deals right now.</p>';

  // Recently Added (last 4)
  const recent = [...products]
    .sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate))
    .slice(0, 6);
  document.getElementById('recentRow').innerHTML = recent.map(p => productCardHTML(p)).join('');

  // Reviews
  document.getElementById('reviewsGrid').innerHTML = REVIEWS.map(r => `
    <div class="review-card">
      <div class="review-stars">${'⭐'.repeat(r.rating)}</div>
      <p class="review-text">"${r.text}"</p>
      <div class="review-author">— ${r.name}</div>
    </div>
  `).join('');
}

// ---- Product Card HTML ----
function productCardHTML(p) {
  const condClass = { New: 'tag-new', Used: 'tag-used', Refurbished: 'tag-refurbished' }[p.condition] || '';
  const imgHTML = p.image
    ? `<img class="product-img" src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
    : '';
  return `
    <div class="product-card" onclick="showDetail(${p.id})">
      <div class="product-img-wrap">
        ${imgHTML}
        <div class="product-img-placeholder" style="${p.image ? 'display:none' : ''}">📱</div>
        ${p.hotDeal ? '<span class="tag-hot">🔥 HOT</span>' : ''}
        <span class="tag-condition ${condClass}">${p.condition}</span>
        ${!p.available ? '<div class="tag-unavailable">Out of Stock</div>' : ''}
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-storage">${p.storage || ''} ${p.ram ? '· ' + p.ram : ''}</div>
        <div class="product-price">₹${p.price.toLocaleString('en-IN')}</div>
      </div>
    </div>
  `;
}

// ---- Category Filter ----
function filterAndGo(category) {
  activeCategoryFilter = category;
  showPage('listing');
  applyFilters();
}

// ---- Filters ----
function renderBrandFilters() {
  const brands = [...new Set(products.map(p => p.brand))].sort();
  document.getElementById('brandFilters').innerHTML = brands.map(b => `
    <label class="check-label">
      <input type="checkbox" value="${b}" onchange="applyFilters()"> ${b}
    </label>
  `).join('');
}

function renderStorageFilters() {
  const storages = [...new Set(products.map(p => p.storage).filter(Boolean))].sort();
  document.getElementById('storageFilters').innerHTML = storages.map(s => `
    <label class="check-label">
      <input type="checkbox" value="${s}" onchange="applyFilters()"> ${s}
    </label>
  `).join('');
}

function getCheckedValues(containerId) {
  return [...document.querySelectorAll(`#${containerId} input:checked`)].map(i => i.value);
}

function applyFilters() {
  const brands = getCheckedValues('brandFilters');
  const conditions = [...document.querySelectorAll('.filter-options input[type=checkbox]:checked')]
    .filter(i => ['New', 'Used', 'Refurbished'].includes(i.value))
    .map(i => i.value);
  const storages = getCheckedValues('storageFilters');

  filteredProducts = products.filter(p => {
    if (brands.length && !brands.includes(p.brand)) return false;
    if (conditions.length && !conditions.includes(p.condition)) return false;
    if (storages.length && !storages.includes(p.storage)) return false;
    if (p.price > priceMax) return false;
    if (activeCategoryFilter && p.category !== activeCategoryFilter) return false;
    return true;
  });

  applySort(currentSort);
}

function applySort(sortVal) {
  currentSort = sortVal;
  let sorted = [...filteredProducts];
  if (sortVal === 'price-asc') sorted.sort((a, b) => a.price - b.price);
  else if (sortVal === 'price-desc') sorted.sort((a, b) => b.price - a.price);
  else if (sortVal === 'newest') sorted.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));

  const grid = document.getElementById('productsGrid');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('resultCount');

  if (sorted.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    count.textContent = '0 phones found';
  } else {
    empty.style.display = 'none';
    grid.innerHTML = sorted.map(p => productCardHTML(p)).join('');
    count.textContent = `${sorted.length} phone${sorted.length > 1 ? 's' : ''} found`;
  }
}

function clearFilters() {
  document.querySelectorAll('.filters-sidebar input[type=checkbox]').forEach(i => i.checked = false);
  document.getElementById('priceRange').value = 150000;
  document.getElementById('priceVal').textContent = '₹1,50,000';
  priceMax = 150000;
  activeCategoryFilter = '';
  currentSort = '';
  document.querySelector('.sort-select').value = '';
  applyFilters();
}

function updatePriceFilter(val) {
  priceMax = parseInt(val);
  document.getElementById('priceVal').textContent = '₹' + parseInt(val).toLocaleString('en-IN');
  applyFilters();
}

function toggleFilters() {
  document.getElementById('filtersSidebar').classList.toggle('open');
}

// ---- Search ----
function handleSearch(query) {
  const dropdown = document.getElementById('searchDropdown');
  if (!query.trim()) { dropdown.innerHTML = ''; return; }

  const results = products.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.brand.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6);

  if (results.length === 0) {
    dropdown.innerHTML = '<div style="padding:14px 16px;color:var(--text-muted);font-size:13px">No results found</div>';
    return;
  }

  dropdown.innerHTML = results.map(p => `
    <div class="search-result-item" onclick="showDetail(${p.id});document.getElementById('searchDropdown').innerHTML='';document.getElementById('searchInput').value=''">
      ${p.image
        ? `<img class="search-result-img" src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src=''">`
        : `<div class="search-result-img" style="display:flex;align-items:center;justify-content:center;font-size:24px">📱</div>`
      }
      <div class="search-result-info">
        <div class="search-result-name">${p.name}</div>
        <div class="search-result-price">₹${p.price.toLocaleString('en-IN')} · ${p.condition}</div>
      </div>
    </div>
  `).join('');
}

// Close search on click outside
document.addEventListener('click', e => {
  if (!e.target.closest('.search-wrap') && !e.target.closest('.search-dropdown')) {
    document.getElementById('searchDropdown').innerHTML = '';
  }
});

// ---- Detail Page ----
function showDetail(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  const condClass = { New: 'tag-new', Used: 'tag-used', Refurbished: 'tag-refurbished' }[p.condition] || '';

  const specsHTML = p.specs
    ? Object.entries(p.specs).map(([k, v]) => `
        <div class="spec-row">
          <span class="spec-key">${k}</span>
          <span class="spec-val">${v}</span>
        </div>
      `).join('')
    : '';

  const batteryHTML = (p.batteryHealth && p.brand === 'Apple') ? `
    <div class="battery-health">
      <div class="battery-label">🔋 Battery Health</div>
      <div class="battery-bar">
        <div class="battery-fill" style="width:${p.batteryHealth}%;background:${p.batteryHealth > 85 ? '#10B981' : p.batteryHealth > 75 ? '#F59E0B' : '#EF4444'}"></div>
      </div>
      <div class="battery-val" style="color:${p.batteryHealth > 85 ? '#10B981' : p.batteryHealth > 75 ? '#F59E0B' : '#EF4444'}">${p.batteryHealth}%</div>
    </div>
  ` : '';

  document.getElementById('detailContainer').innerHTML = `
    <div class="detail-back" onclick="history.back()">← Back</div>
    <div class="detail-images">
      ${p.image
        ? `<img src="${p.image}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : ''
      }
      <div class="placeholder" style="${p.image ? 'display:none' : ''}">📱</div>
    </div>
    <div class="detail-body">
      <div class="detail-tags">
        ${p.hotDeal ? '<span class="detail-badge" style="background:#FEE2E2;color:#991B1B">🔥 Hot Deal</span>' : ''}
        <span class="detail-badge ${condClass}">${p.condition}</span>
        <span class="${p.available ? 'avail-on' : 'avail-off'}">${p.available ? '✅ Available' : '❌ Out of Stock'}</span>
      </div>
      <h1 class="detail-name">${p.name}</h1>
      <div class="detail-price">₹${p.price.toLocaleString('en-IN')}</div>
      ${p.description ? `<p class="detail-desc">${p.description}</p>` : ''}

      ${batteryHTML}

      ${specsHTML ? `
        <div class="detail-specs">
          <h4>Specifications</h4>
          ${specsHTML}
        </div>
      ` : ''}

      <div class="detail-cta">
        <button class="btn btn-primary" onclick="openWhatsApp('${p.name}')">
          💬 Check Availability on WhatsApp
        </button>
        ${p.available
          ? `<button class="btn btn-outline btn-sm" onclick="openWhatsApp('${p.name} — I want to buy it')">Buy Now</button>`
          : `<button class="btn btn-outline btn-sm" onclick="openWhatsApp('${p.name} — Notify me when available')">Notify Me</button>`
        }
      </div>
    </div>
  `;

  showPage('detail');
}

// History back button support
window.addEventListener('popstate', () => showPage('home'));

// ---- Admin ----
let adminUnlocked = false;

function checkAdminPass() {
  const val = document.getElementById('adminPass').value;
  if (val === ADMIN_PASSWORD) {
    adminUnlocked = true;
    document.getElementById('adminAuth').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    renderAdminProducts();
  } else {
    showToast('❌ Wrong password');
  }
}

document.getElementById('adminPass').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkAdminPass();
});

function renderAdminProducts() {
  if (!adminUnlocked) return;
  const container = document.getElementById('adminProducts');
  container.innerHTML = products.map(p => `
    <div class="admin-product-row">
      ${p.image
        ? `<img class="admin-product-img" src="${p.image}" alt="${p.name}" onerror="this.src=''">`
        : `<div class="admin-product-img" style="display:flex;align-items:center;justify-content:center;font-size:24px;background:var(--bg-sidebar)">📱</div>`
      }
      <div class="admin-product-info">
        <div class="admin-product-name">${p.name}</div>
        <div class="admin-product-meta">₹${p.price.toLocaleString('en-IN')} · ${p.condition} · ${p.available ? '✅ Available' : '❌ Sold'} ${p.hotDeal ? '· 🔥 Hot' : ''}</div>
      </div>
      <div class="admin-product-actions">
        <button class="btn btn-sm btn-outline" onclick="showAdminForm(${p.id})">✏️</button>
        <button class="btn btn-sm" style="background:${p.available ? '#FEF3C7' : '#D1FAE5'};color:${p.available ? '#92400E' : '#065F46'}"
          onclick="toggleAvailability(${p.id})">${p.available ? 'Mark Sold' : 'Mark Available'}</button>
        <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">🗑️</button>
      </div>
    </div>
  `).join('');
}

function toggleAvailability(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  p.available = !p.available;
  saveProducts();
  renderAdminProducts();
  renderHome();
  showToast(`${p.name} marked as ${p.available ? 'Available' : 'Sold'}`);
}

function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  products = products.filter(p => p.id !== id);
  saveProducts();
  renderAdminProducts();
  renderBrandFilters();
  renderStorageFilters();
  renderHome();
  applyFilters();
  showToast('Product deleted');
}

function showAdminForm(id) {
  const form = document.getElementById('adminForm');
  form.style.display = 'block';
  form.scrollIntoView({ behavior: 'smooth' });

  if (id === null) {
    // New product
    document.getElementById('formTitle').textContent = 'Add New Phone';
    document.getElementById('fEditId').value = '';
    document.getElementById('fName').value = '';
    document.getElementById('fBrand').value = 'Apple';
    document.getElementById('fPrice').value = '';
    document.getElementById('fCondition').value = 'New';
    document.getElementById('fStorage').value = '';
    document.getElementById('fRam').value = '';
    document.getElementById('fBattery').value = '';
    document.getElementById('fCategory').value = 'iPhone';
    document.getElementById('fImage').value = '';
    document.getElementById('fDesc').value = '';
    document.getElementById('fSpecs').value = '';
    document.getElementById('fHotDeal').checked = false;
    document.getElementById('fAvailable').checked = true;
  } else {
    // Edit product
    const p = products.find(x => x.id === id);
    if (!p) return;
    document.getElementById('formTitle').textContent = 'Edit Phone';
    document.getElementById('fEditId').value = id;
    document.getElementById('fName').value = p.name;
    document.getElementById('fBrand').value = p.brand;
    document.getElementById('fPrice').value = p.price;
    document.getElementById('fCondition').value = p.condition;
    document.getElementById('fStorage').value = p.storage || '';
    document.getElementById('fRam').value = p.ram || '';
    document.getElementById('fBattery').value = p.batteryHealth || '';
    document.getElementById('fCategory').value = p.category;
    document.getElementById('fImage').value = p.image || '';
    document.getElementById('fDesc').value = p.description || '';
    document.getElementById('fSpecs').value = p.specs
      ? Object.entries(p.specs).map(([k, v]) => `${k}: ${v}`).join('\n')
      : '';
    document.getElementById('fHotDeal').checked = p.hotDeal;
    document.getElementById('fAvailable').checked = p.available;
  }
}

function saveProduct() {
  const name = document.getElementById('fName').value.trim();
  const price = parseInt(document.getElementById('fPrice').value);
  if (!name) { showToast('❌ Phone name is required'); return; }
  if (!price || price < 0) { showToast('❌ Valid price is required'); return; }

  const specsRaw = document.getElementById('fSpecs').value.trim();
  const specs = {};
  if (specsRaw) {
    specsRaw.split('\n').forEach(line => {
      const [key, ...rest] = line.split(':');
      if (key && rest.length) specs[key.trim()] = rest.join(':').trim();
    });
  }

  const editId = document.getElementById('fEditId').value;
  const productData = {
    name,
    brand: document.getElementById('fBrand').value,
    price,
    condition: document.getElementById('fCondition').value,
    storage: document.getElementById('fStorage').value.trim(),
    ram: document.getElementById('fRam').value.trim(),
    batteryHealth: parseInt(document.getElementById('fBattery').value) || null,
    category: document.getElementById('fCategory').value,
    image: document.getElementById('fImage').value.trim(),
    description: document.getElementById('fDesc').value.trim(),
    specs: Object.keys(specs).length ? specs : null,
    hotDeal: document.getElementById('fHotDeal').checked,
    available: document.getElementById('fAvailable').checked,
  };

  if (editId) {
    const idx = products.findIndex(p => p.id === parseInt(editId));
    if (idx >= 0) {
      products[idx] = { ...products[idx], ...productData };
    }
    showToast('✅ Phone updated!');
  } else {
    const newId = Math.max(0, ...products.map(p => p.id)) + 1;
    products.unshift({ id: newId, addedDate: new Date(), ...productData });
    showToast('✅ Phone added!');
  }

  saveProducts();
  renderAdminProducts();
  renderBrandFilters();
  renderStorageFilters();
  renderHome();
  applyFilters();
  document.getElementById('adminForm').style.display = 'none';
}

// ---- Toast ----
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
