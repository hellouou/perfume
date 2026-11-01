/**
 * L'ATELIER DU PARFUM - Main Application Controller
 * 전체 인터랙션, 필터링, 모달, 위시리스트, 시향 키트, 캔버스 이펙트 제어
 */

// State Management
const appState = {
  activeCategory: "all",
  activeSeason: "all",
  activeGender: "all",
  sortBy: "popular",
  searchQuery: "",
  wishlist: JSON.parse(localStorage.getItem("atelier_wishlist") || "[]"),
  discoveryKit: JSON.parse(localStorage.getItem("atelier_kit") || "[]"),
  userNotes: JSON.parse(localStorage.getItem("atelier_user_notes") || "{}"),
  currentModalPerfumeId: null
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  initHeroCanvas();
  renderFamilyTabs();
  renderPerfumeCards();
  initSearchAndFilters();
  updateWishlistUI();
  updateKitUI();

  // Initialize Quiz & Layering
  perfumeQuiz.init();
  layeringStudio.init();

  // Mobile navigation toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileNav = document.getElementById("mobile-nav");
  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileNav.classList.toggle("hidden");
    });
  }
});

/**
 * ----------------------------------------------------
 * 1. HERO AMBIENT CANVAS (은은하게 피어오르는 향기 미스트)
 * ----------------------------------------------------
 */
function initHeroCanvas() {
  const canvas = document.getElementById("hero-mist-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = (canvas.width = canvas.parentElement.offsetWidth);
  let height = (canvas.height = canvas.parentElement.offsetHeight);

  window.addEventListener("resize", () => {
    if (!canvas.parentElement) return;
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  });

  const particles = [];
  const particleCount = 45;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.6 - 0.2,
      opacity: Math.random() * 0.5 + 0.1,
      hue: Math.random() > 0.5 ? 320 : 338 // Black & Pink editorial theme mist hues
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.y < 0) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;

      ctx.beginPath();
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2);
      grad.addColorStop(0, `hsla(${p.hue}, 80%, 75%, ${p.opacity})`);
      grad.addColorStop(1, `hsla(${p.hue}, 80%, 75%, 0)`);
      ctx.fillStyle = grad;
      ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/**
 * ----------------------------------------------------
 * 2. FRAGRANCE FAMILY TABS
 * ----------------------------------------------------
 */
function renderFamilyTabs() {
  const container = document.getElementById("family-tabs-container");
  if (!container) return;

  const allTab = `
    <button type="button" class="family-tab active" data-category="all" onclick="selectCategory('all')">
      <span class="tab-icon">✨</span>
      <span class="tab-title">전체 보기</span>
    </button>
  `;

  const tabs = Object.entries(FRAGRANCE_FAMILIES).map(([key, item]) => {
    return `
      <button type="button" class="family-tab" data-category="${key}" onclick="selectCategory('${key}')">
        <span class="tab-icon">${item.icon}</span>
        <span class="tab-title">${item.nameKo.split(" ")[0]}</span>
      </button>
    `;
  }).join("");

  container.innerHTML = allTab + tabs;
}

function selectCategory(cat) {
  appState.activeCategory = cat;

  document.querySelectorAll(".family-tab").forEach(tab => {
    if (tab.getAttribute("data-category") === cat) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  // Display category banner description if selected
  const banner = document.getElementById("family-intro-banner");
  if (banner) {
    if (cat === "all") {
      banner.classList.add("hidden");
    } else {
      const fam = FRAGRANCE_FAMILIES[cat];
      banner.classList.remove("hidden");
      banner.innerHTML = `
        <div class="banner-content">
          <span class="banner-icon">${fam.icon}</span>
          <div>
            <h4 class="banner-name">${fam.nameKo}</h4>
            <p class="banner-desc">${fam.desc}</p>
          </div>
        </div>
      `;
    }
  }

  renderPerfumeCards();
}

/**
 * ----------------------------------------------------
 * 3. PERFUME EXPLORER & FILTERING
 * ----------------------------------------------------
 */
function initSearchAndFilters() {
  const searchInput = document.getElementById("perfume-search-input");
  const seasonSelect = document.getElementById("filter-season-select");
  const genderSelect = document.getElementById("filter-gender-select");
  const sortSelect = document.getElementById("filter-sort-select");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      appState.searchQuery = e.target.value.trim().toLowerCase();
      renderPerfumeCards();
    });
  }

  if (seasonSelect) {
    seasonSelect.addEventListener("change", (e) => {
      appState.activeSeason = e.target.value;
      renderPerfumeCards();
    });
  }

  if (genderSelect) {
    genderSelect.addEventListener("change", (e) => {
      appState.activeGender = e.target.value;
      renderPerfumeCards();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      appState.sortBy = e.target.value;
      renderPerfumeCards();
    });
  }
}

function renderPerfumeCards() {
  const grid = document.getElementById("perfumes-grid");
  const countSpan = document.getElementById("perfume-count-display");
  if (!grid) return;

  // Filter list
  let filtered = PERFUMES_DATA.filter(p => {
    // 1. Category
    if (appState.activeCategory !== "all" && p.category !== appState.activeCategory) {
      return false;
    }

    // 2. Season
    if (appState.activeSeason !== "all" && !p.season.includes(appState.activeSeason)) {
      return false;
    }

    // 3. Gender
    if (appState.activeGender !== "all" && p.gender !== appState.activeGender && p.gender !== "unisex") {
      return false;
    }

    // 4. Search query (matches name, nameKo, brand, brandKo, topNotes, middleNotes, baseNotes, story)
    if (appState.searchQuery) {
      const q = appState.searchQuery;
      const notesStr = [...p.topNotes, ...p.middleNotes, ...p.baseNotes].join(" ").toLowerCase();
      const combined = `${p.name} ${p.nameKo} ${p.brand} ${p.brandKo} ${notesStr} ${p.categoryKo} ${p.story}`.toLowerCase();
      if (!combined.includes(q)) return false;
    }

    return true;
  });

  // Sort list
  if (appState.sortBy === "longevity") {
    filtered.sort((a, b) => b.longevity - a.longevity);
  } else if (appState.sortBy === "sillage") {
    filtered.sort((a, b) => b.sillage - a.sillage);
  } else if (appState.sortBy === "name") {
    filtered.sort((a, b) => a.nameKo.localeCompare(b.nameKo));
  } else {
    // Popular: default order in database
  }

  if (countSpan) {
    countSpan.textContent = `${filtered.length}개의 향수`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state-card col-span-full">
        <i class="fa-solid fa-wind"></i>
        <h3>일치하는 향수를 찾을 수 없습니다</h3>
        <p>선택하신 필터나 검색어를 변경해 보세요.</p>
        <button type="button" class="btn btn-outline" onclick="resetFilters()">필터 초기화</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const isWishlisted = appState.wishlist.includes(p.id);
    const isInKit = appState.discoveryKit.includes(p.id);

    return `
      <div class="perfume-card fade-in" data-id="${p.id}">
        <!-- Top Visual Header with stylized bottle -->
        <div class="card-visual-wrapper" style="--card-tint: ${p.bottleColor}">
          <button type="button" class="card-wishlist-btn ${isWishlisted ? 'active' : ''}" onclick="toggleWishlist('${p.id}', event)" title="위시리스트 추가">
            <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
          </button>

          <div class="mini-bottle-graphic" style="--bottle-color: ${p.bottleColor}; --accent-color: ${p.accentColor}">
            <div class="mini-cap"></div>
            <div class="mini-neck"></div>
            <div class="mini-body">
              <span class="mini-label">${p.brand}</span>
            </div>
          </div>

          <span class="card-category-tag">${p.categoryKo.split(" ")[0]}</span>
        </div>

        <!-- Card Body -->
        <div class="card-content">
          <div class="card-brand">${p.brandKo} <span class="en-brand">${p.brand}</span></div>
          <h4 class="card-title">${p.nameKo} <span class="en-title">${p.name}</span></h4>
          <p class="card-quote">"${p.quote}"</p>

          <!-- Note Pills -->
          <div class="card-notes-pills">
            <span class="note-pill top-pill">탑: ${p.topNotes[0]}</span>
            <span class="note-pill heart-pill">미들: ${p.middleNotes[0]}</span>
            <span class="note-pill base-pill">베이스: ${p.baseNotes[0]}</span>
          </div>

          <!-- Rating Indicators -->
          <div class="card-metrics">
            <div class="metric-item">
              <span class="metric-label">지속력</span>
              <div class="stars-bar">${'★'.repeat(p.longevity)}${'☆'.repeat(5 - p.longevity)}</div>
            </div>
            <div class="metric-item">
              <span class="metric-label">확산력</span>
              <div class="stars-bar">${'●'.repeat(p.sillage)}${'○'.repeat(5 - p.sillage)}</div>
            </div>
          </div>

          <!-- Actions -->
          <div class="card-actions">
            <button type="button" class="btn btn-sm btn-outline card-detail-btn" onclick="openPerfumeDetail('${p.id}')">
              <i class="fa-solid fa-circle-info"></i> 시향 피라미드
            </button>
            <button type="button" class="btn btn-sm ${isInKit ? 'btn-secondary' : 'btn-primary'} card-kit-btn" onclick="addToDiscoveryKit('${p.id}', event)">
              <i class="fa-solid ${isInKit ? 'fa-check' : 'fa-plus'}"></i> ${isInKit ? '키트 담김' : '시향 키트'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function resetFilters() {
  appState.activeCategory = "all";
  appState.activeSeason = "all";
  appState.activeGender = "all";
  appState.searchQuery = "";
  appState.sortBy = "popular";

  const searchInput = document.getElementById("perfume-search-input");
  const seasonSelect = document.getElementById("filter-season-select");
  const genderSelect = document.getElementById("filter-gender-select");
  const sortSelect = document.getElementById("filter-sort-select");

  if (searchInput) searchInput.value = "";
  if (seasonSelect) seasonSelect.value = "all";
  if (genderSelect) genderSelect.value = "all";
  if (sortSelect) sortSelect.value = "popular";

  selectCategory("all");
}

/**
 * ----------------------------------------------------
 * 4. SCENT PYRAMID & PERFUME DETAIL MODAL
 * ----------------------------------------------------
 */
function openPerfumeDetail(perfumeId) {
  const p = PERFUMES_DATA.find(item => item.id === perfumeId);
  if (!p) return;

  appState.currentModalPerfumeId = perfumeId;
  const modal = document.getElementById("perfume-detail-modal");
  const body = document.getElementById("perfume-modal-body");
  if (!modal || !body) return;

  const isWishlisted = appState.wishlist.includes(p.id);
  const isInKit = appState.discoveryKit.includes(p.id);
  const savedUserNote = appState.userNotes[p.id] || { rating: 5, memo: "" };

  // Seasons string
  const seasonsMap = { spring: "봄 🌸", summer: "여름 🌊", autumn: "가을 🍂", winter: "겨울 ❄️" };
  const seasonBadges = p.season.map(s => `<span class="badge-tag">${seasonsMap[s] || s}</span>`).join(" ");

  // Layering partners
  const pairingCards = (p.pairingRecommended || []).map(partnerId => {
    const partner = PERFUMES_DATA.find(x => x.id === partnerId);
    if (!partner) return "";
    return `
      <div class="modal-pairing-card" onclick="layeringStudio.setSelection('${p.id}', '${partner.id}'); closePerfumeDetail();">
        <span class="pairing-badge">추천 듀오</span>
        <div class="pairing-name">${partner.brandKo} ${partner.nameKo}</div>
        <div class="pairing-action">조합 테스트해보기 <i class="fa-solid fa-arrow-right"></i></div>
      </div>
    `;
  }).join("");

  body.innerHTML = `
    <div class="modal-perfume-layout">
      <!-- Left Visual & Specs -->
      <div class="modal-visual-col">
        <div class="large-bottle-visual" style="--bottle-color: ${p.bottleColor}; --accent-color: ${p.accentColor}">
          <div class="large-cap"></div>
          <div class="large-neck"></div>
          <div class="large-body">
            <div class="large-label">
              <span class="large-brand">${p.brand}</span>
              <span class="large-name">${p.name}</span>
            </div>
          </div>
        </div>

        <div class="perfume-quick-stats">
          <div class="stat-row">
            <span>계열</span>
            <strong>${p.categoryKo}</strong>
          </div>
          <div class="stat-row">
            <span>추천 계절</span>
            <div>${seasonBadges}</div>
          </div>
          <div class="stat-row">
            <span>성별 지향</span>
            <strong>${p.gender === 'unisex' ? '젠더리스 (Unisex)' : p.gender === 'feminine' ? '페미닌' : '마스큘린'}</strong>
          </div>
          <div class="stat-row">
            <span>지속력 (Longevity)</span>
            <strong>${'★'.repeat(p.longevity)}${'☆'.repeat(5 - p.longevity)} (${p.longevity}/5)</strong>
          </div>
          <div class="stat-row">
            <span>발향력 (Sillage)</span>
            <strong>${'●'.repeat(p.sillage)}${'○'.repeat(5 - p.sillage)} (${p.sillage}/5)</strong>
          </div>
        </div>

        <div class="modal-action-buttons">
          <button type="button" class="btn btn-primary btn-block" onclick="addToDiscoveryKit('${p.id}')">
            <i class="fa-solid fa-plus"></i> ${isInKit ? '시향 키트 담김' : '나만의 시향 키트에 담기'}
          </button>
          <button type="button" class="btn btn-outline btn-block" onclick="toggleWishlist('${p.id}')">
            <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i> ${isWishlisted ? '위시리스트에서 제거' : '위시리스트에 저장'}
          </button>
        </div>
      </div>

      <!-- Right Note Pyramid & Story -->
      <div class="modal-info-col">
        <div class="modal-brand-header">
          <span class="modal-brand-name">${p.brandKo} · ${p.brand}</span>
          <h2 class="modal-title-name">${p.nameKo} <span class="modal-sub-name">${p.name}</span></h2>
          <p class="modal-quote">"${p.quote}"</p>
        </div>

        <!-- 3D Fragrance Pyramid -->
        <div class="fragrance-pyramid-container">
          <h4 class="pyramid-headline"><i class="fa-solid fa-layer-group"></i> 조향 노트 피라미드 (Scent Pyramid)</h4>
          
          <div class="scent-pyramid-structure">
            <!-- Top Notes -->
            <div class="pyramid-tier tier-top">
              <div class="tier-label">
                <strong>TOP NOTE</strong>
                <span>첫인상 (분사 직후 ~ 15분)</span>
              </div>
              <div class="tier-notes">
                ${p.topNotes.map(n => `<span class="note-chip">${n}</span>`).join("")}
              </div>
            </div>

            <!-- Heart Notes -->
            <div class="pyramid-tier tier-heart">
              <div class="tier-label">
                <strong>HEART / MIDDLE NOTE</strong>
                <span>향의 본질 & 하모니 (30분 ~ 2시간)</span>
              </div>
              <div class="tier-notes">
                ${p.middleNotes.map(n => `<span class="note-chip">${n}</span>`).join("")}
              </div>
            </div>

            <!-- Base Notes -->
            <div class="pyramid-tier tier-base">
              <div class="tier-label">
                <strong>BASE NOTE</strong>
                <span>잔향 & 여운 (2시간 ~ 하루 종일)</span>
              </div>
              <div class="tier-notes">
                ${p.baseNotes.map(n => `<span class="note-chip">${n}</span>`).join("")}
              </div>
            </div>
          </div>
        </div>

        <!-- Scent Story -->
        <div class="scent-story-section">
          <h4><i class="fa-solid fa-book-open"></i> 향수의 스토리텔링</h4>
          <p class="story-paragraph">${p.story}</p>
        </div>

        <!-- Layering Recommendations -->
        ${
          p.pairingRecommended && p.pairingRecommended.length > 0
            ? `
            <div class="scent-pairing-section">
              <h4><i class="fa-solid fa-spray-can-sparkles"></i> 조향사 추천 레이어링</h4>
              <p class="pairing-tip-text">${p.pairingReason}</p>
              <div class="pairing-cards-grid">${pairingCards}</div>
            </div>
          `
            : ''
        }

        <!-- My Tasting Memo -->
        <div class="user-tasting-memo-box">
          <h4><i class="fa-solid fa-pen-nib"></i> 나만의 시향 노트 기록</h4>
          <p class="memo-guide">이 향수를 시향해 보셨나요? 나만의 첫인상과 느낌을 메모해 보세요.</p>
          <textarea id="modal-user-memo" placeholder="예: 시원한 편백나무 향이 나면서 마음이 편안해짐. 가을 니트에 잘 어울릴 듯!">${savedUserNote.memo || ""}</textarea>
          <div class="memo-save-row">
            <button type="button" class="btn btn-sm btn-primary" onclick="saveUserNote('${p.id}')">
              <i class="fa-solid fa-floppy-disk"></i> 시향 메모 저장
            </button>
            <span id="memo-saved-indicator" class="memo-saved-text hidden">✓ 저장되었습니다</span>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closePerfumeDetail() {
  const modal = document.getElementById("perfume-detail-modal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "auto";
  }
}

function saveUserNote(perfumeId) {
  const textarea = document.getElementById("modal-user-memo");
  const indicator = document.getElementById("memo-saved-indicator");
  if (!textarea) return;

  const memo = textarea.value.trim();
  appState.userNotes[perfumeId] = {
    memo: memo,
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem("atelier_user_notes", JSON.stringify(appState.userNotes));

  if (indicator) {
    indicator.classList.remove("hidden");
    setTimeout(() => {
      indicator.classList.add("hidden");
    }, 2000);
  }
  showToast("시향 노트가 저장되었습니다.");
}

/**
 * ----------------------------------------------------
 * 5. WISHLIST MANAGEMENT
 * ----------------------------------------------------
 */
function toggleWishlist(perfumeId, event) {
  if (event) event.stopPropagation();

  const idx = appState.wishlist.indexOf(perfumeId);
  const perfume = PERFUMES_DATA.find(p => p.id === perfumeId);

  if (idx > -1) {
    appState.wishlist.splice(idx, 1);
    showToast(`'${perfume ? perfume.nameKo : '향수'}' 위시리스트에서 삭제되었습니다.`);
  } else {
    appState.wishlist.push(perfumeId);
    showToast(`'${perfume ? perfume.nameKo : '향수'}' 위시리스트에 담겼습니다!`);
  }

  localStorage.setItem("atelier_wishlist", JSON.stringify(appState.wishlist));
  updateWishlistUI();
  renderPerfumeCards();

  // If modal is open, re-render modal button
  if (appState.currentModalPerfumeId === perfumeId) {
    openPerfumeDetail(perfumeId);
  }
}

function updateWishlistUI() {
  const badge = document.getElementById("nav-wishlist-count");
  if (badge) {
    badge.textContent = appState.wishlist.length;
    badge.style.display = appState.wishlist.length > 0 ? "inline-flex" : "none";
  }
}

function openWishlistModal() {
  const modal = document.getElementById("wishlist-modal");
  const container = document.getElementById("wishlist-items-container");
  if (!modal || !container) return;

  if (appState.wishlist.length === 0) {
    container.innerHTML = `
      <div class="empty-kit-state">
        <i class="fa-regular fa-heart"></i>
        <h4>아직 찜한 향수가 없습니다</h4>
        <p>마음에 드는 향수 카드의 하트를 눌러 나만의 위시리스트를 완성해 보세요.</p>
      </div>
    `;
  } else {
    container.innerHTML = appState.wishlist.map(id => {
      const p = PERFUMES_DATA.find(item => item.id === id);
      if (!p) return "";
      const noteObj = appState.userNotes[id];
      return `
        <div class="wishlist-item-row">
          <div class="wishlist-item-info">
            <span class="item-brand">${p.brandKo}</span>
            <h4 class="item-name">${p.nameKo} <span class="en">${p.name}</span></h4>
            <p class="item-notes">${p.topNotes[0]} · ${p.middleNotes[0]} · ${p.baseNotes[0]}</p>
            ${noteObj && noteObj.memo ? `<div class="item-memo"><i class="fa-solid fa-quote-left"></i> ${noteObj.memo}</div>` : ''}
          </div>
          <div class="wishlist-item-actions">
            <button class="btn btn-sm btn-outline" onclick="openPerfumeDetail('${p.id}'); closeWishlistModal();">상세보기</button>
            <button class="btn btn-sm btn-primary" onclick="addToDiscoveryKit('${p.id}')">키트 담기</button>
            <button class="btn btn-sm btn-icon-del" onclick="toggleWishlist('${p.id}')" title="삭제"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        </div>
      `;
    }).join("");
  }

  modal.classList.remove("hidden");
}

function closeWishlistModal() {
  const modal = document.getElementById("wishlist-modal");
  if (modal) modal.classList.add("hidden");
}

/**
 * ----------------------------------------------------
 * 6. VIRTUAL 3-PIECE DISCOVERY KIT (나만의 시향 키트)
 * ----------------------------------------------------
 */
function addToDiscoveryKit(perfumeId, event) {
  if (event) event.stopPropagation();

  const perfume = PERFUMES_DATA.find(p => p.id === perfumeId);
  if (!perfume) return;

  if (appState.discoveryKit.includes(perfumeId)) {
    showToast(`이미 시향 키트에 담겨 있는 향수입니다.`);
    openDiscoveryKitDrawer();
    return;
  }

  if (appState.discoveryKit.length >= 3) {
    showToast(`시향 키트는 최대 3개까지만 구성할 수 있습니다. 기존 항목을 변경해 주세요.`);
    openDiscoveryKitDrawer();
    return;
  }

  appState.discoveryKit.push(perfumeId);
  localStorage.setItem("atelier_kit", JSON.stringify(appState.discoveryKit));

  updateKitUI();
  renderPerfumeCards();
  showToast(`[${perfume.nameKo}] 시향 키트에 담겼습니다! (현재 ${appState.discoveryKit.length}/3)`);
  openDiscoveryKitDrawer();
}

function removeFromDiscoveryKit(perfumeId) {
  const idx = appState.discoveryKit.indexOf(perfumeId);
  if (idx > -1) {
    appState.discoveryKit.splice(idx, 1);
    localStorage.setItem("atelier_kit", JSON.stringify(appState.discoveryKit));
    updateKitUI();
    renderPerfumeCards();
    renderDiscoveryKitContent();
    showToast("시향 키트에서 제외되었습니다.");
  }
}

function clearDiscoveryKit() {
  appState.discoveryKit = [];
  localStorage.setItem("atelier_kit", JSON.stringify(appState.discoveryKit));
  updateKitUI();
  renderPerfumeCards();
  renderDiscoveryKitContent();
  showToast("시향 키트를 비웠습니다.");
}

function updateKitUI() {
  const badge = document.getElementById("nav-kit-count");
  if (badge) {
    badge.textContent = `${appState.discoveryKit.length}/3`;
  }
}

function openDiscoveryKitDrawer() {
  const drawer = document.getElementById("discovery-kit-drawer");
  if (drawer) {
    renderDiscoveryKitContent();
    drawer.classList.remove("hidden");
  }
}

function closeDiscoveryKitDrawer() {
  const drawer = document.getElementById("discovery-kit-drawer");
  if (drawer) drawer.classList.add("hidden");
}

function renderDiscoveryKitContent() {
  const container = document.getElementById("discovery-kit-slots");
  const footer = document.getElementById("discovery-kit-footer");
  if (!container) return;

  const maxSlots = 3;
  let slotsHtml = "";

  for (let i = 0; i < maxSlots; i++) {
    const perfumeId = appState.discoveryKit[i];
    if (perfumeId) {
      const p = PERFUMES_DATA.find(item => item.id === perfumeId);
      slotsHtml += `
        <div class="kit-slot filled">
          <div class="slot-badge">SAMPLE 0${i + 1} (2ml)</div>
          <div class="slot-info">
            <div class="slot-brand">${p.brandKo}</div>
            <div class="slot-name">${p.nameKo}</div>
            <div class="slot-accords">${p.categoryKo} · ${p.topNotes[0]}</div>
          </div>
          <button type="button" class="slot-remove-btn" onclick="removeFromDiscoveryKit('${p.id}')" title="삭제">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      `;
    } else {
      slotsHtml += `
        <div class="kit-slot empty" onclick="closeDiscoveryKitDrawer(); location.href='#explore-section';">
          <div class="empty-icon"><i class="fa-solid fa-plus"></i></div>
          <div class="empty-text">0${i + 1}번째 시향 샘플 선택하기</div>
          <span class="empty-hint">원하는 향수에서 '+ 시향 키트'를 눌러주세요</span>
        </div>
      `;
    }
  }

  container.innerHTML = slotsHtml;

  if (footer) {
    const isComplete = appState.discoveryKit.length === 3;
    footer.innerHTML = `
      <div class="kit-summary-bar">
        <span>선택된 샘플: <strong>${appState.discoveryKit.length} / 3</strong></span>
        ${
          appState.discoveryKit.length > 0
            ? `<button class="btn-text-danger" onclick="clearDiscoveryKit()">전체 비우기</button>`
            : ''
        }
      </div>
      <button 
        type="button" 
        class="btn btn-primary btn-block ${isComplete ? '' : 'disabled'}"
        onclick="requestDiscoveryKit()"
      >
        <i class="fa-solid fa-gift"></i> ${isComplete ? '나만의 3종 시향 키트 신청 시뮬레이션' : '향수 3종을 모두 채워주세요'}
      </button>
    `;
  }
}

function requestDiscoveryKit() {
  if (appState.discoveryKit.length < 3) {
    showToast("3가지 향수를 모두 선택해야 시향 키트를 완성할 수 있습니다.");
    return;
  }

  const names = appState.discoveryKit.map(id => {
    const p = PERFUMES_DATA.find(x => x.id === id);
    return `• [${p.brandKo}] ${p.nameKo} (${p.categoryKo})`;
  }).join("\n");

  const summary = `✨ [L'ATELIER DU PARFUM] 나만의 3종 시향 키트:\n${names}\n\n당신의 취향을 담은 3종 세트가 완성되었습니다!`;
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(summary).then(() => {
      showToast("시향 키트 구성 목록이 클립보드에 복사되었습니다! 🎉");
    });
  } else {
    showToast("3종 시향 키트가 성공적으로 확정되었습니다!");
  }
}

/**
 * ----------------------------------------------------
 * 7. UTILITY & TOAST NOTIFICATIONS
 * ----------------------------------------------------
 */
function showToast(message) {
  let toast = document.getElementById("atelier-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "atelier-toast";
    toast.className = "atelier-toast";
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;
  toast.classList.add("show");

  clearTimeout(window.__toastTimeout);
  window.__toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

function copyResultShareLink(perfumeName, auraName) {
  const shareText = `[아틀리에 드 퍼퓸] 나의 시그니처 향기 오라는 '${auraName}'! 추천 향수: ${perfumeName}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareText).then(() => {
      showToast("결과 요약이 클립보드에 복사되었습니다. 친구에게 공유해보세요!");
    });
  } else {
    showToast("공유 텍스트가 준비되었습니다.");
  }
}

