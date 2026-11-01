/**
 * L'ATELIER DU PARFUM - Scent Layering Studio
 * 두 가지 향수의 화학적 조화와 레이어링 팁을 분석하는 스튜디오
 */

class LayeringStudio {
  constructor() {
    this.selectA = document.getElementById("layer-select-a");
    this.selectB = document.getElementById("layer-select-b");
    this.resultBox = document.getElementById("layer-analysis-result");
    this.recipesContainer = document.getElementById("layer-recipes-container");
  }

  init() {
    this.populateSelects();
    this.renderPresetRecipes();
    this.attachEvents();
  }

  populateSelects() {
    if (!this.selectA || !this.selectB) return;

    const optionsHtml = PERFUMES_DATA.map(
      p => `<option value="${p.id}">[${p.brandKo}] ${p.nameKo} (${p.categoryKo})</option>`
    ).join("");

    this.selectA.innerHTML = `<option value="">첫 번째 베이스 향수를 선택하세요</option>` + optionsHtml;
    this.selectB.innerHTML = `<option value="">두 번째 레이어 향수를 선택하세요</option>` + optionsHtml;

    // Default select 2 popular ones
    this.selectA.value = "diptyque-tam-dao";
    this.selectB.value = "aesop-tacit";
    this.analyze();
  }

  attachEvents() {
    if (this.selectA) {
      this.selectA.addEventListener("change", () => this.analyze());
    }
    if (this.selectB) {
      this.selectB.addEventListener("change", () => this.analyze());
    }
  }

  setSelection(idA, idB) {
    if (this.selectA) this.selectA.value = idA;
    if (this.selectB) this.selectB.value = idB;
    this.analyze();

    const studioSection = document.getElementById("layering-section");
    if (studioSection) {
      studioSection.scrollIntoView({ behavior: "smooth" });
    }
  }

  analyze() {
    const idA = this.selectA ? this.selectA.value : null;
    const idB = this.selectB ? this.selectB.value : null;

    if (!idA || !idB || !this.resultBox) return;

    if (idA === idB) {
      this.resultBox.innerHTML = `
        <div class="empty-layer-state">
          <i class="fa-solid fa-circle-exclamation text-amber-500"></i>
          <p>서로 다른 두 가지 향수를 선택하시면 시너지 분석 결과를 확인하실 수 있습니다.</p>
        </div>
      `;
      return;
    }

    const perfA = PERFUMES_DATA.find(p => p.id === idA);
    const perfB = PERFUMES_DATA.find(p => p.id === idB);

    if (!perfA || !perfB) return;

    // Check if there is a preset recipe for this pair (in either direction)
    const preset = LAYERING_RECIPES.find(
      r =>
        (r.perfumeA === idA && r.perfumeB === idB) ||
        (r.perfumeA === idB && r.perfumeB === idA)
    );

    let harmonyScore = 90;
    let title = "";
    let mood = "";
    let desc = "";
    let ratioTip = "";

    if (preset) {
      harmonyScore = preset.harmonyScore;
      title = preset.title;
      mood = preset.mood;
      desc = preset.description;
      ratioTip = preset.ratioTip;
    } else {
      // Dynamic AI calculation
      const catA = perfA.category;
      const catB = perfB.category;

      const compatibilityMatrix = {
        "woody+citrus": { score: 96, mood: "청량한 숲속의 신선한 바람", title: "싱그러운 보태니컬 우디" },
        "woody+musk": { score: 98, mood: "체온에 녹아드는 궁극의 살냄새", title: "소프트 캐시미어 우드" },
        "floral+musk": { score: 97, mood: "포근하고 순결한 생화의 정원", title: "퓨어 블라썸 린넨" },
        "floral+woody": { score: 93, mood: "세련되고 지적인 깊이감", title: "가든 앤 오크 모스" },
        "citrus+aquatic": { score: 95, mood: "시원하고 청명한 지중해 해변", title: "지중해 솔트 브리즈" },
        "oriental+gourmand": { score: 94, mood: "달콤하고 농밀한 이브닝 파티", title: "미드나잇 벨벳 앰버" },
        "oriental+woody": { score: 95, mood: "중후한 럭셔리와 그윽한 인센스", title: "스모키 로열 오드" },
        "green+citrus": { score: 96, mood: "갓 딴 풀잎과 생과즙의 싱그러움", title: "모닝 듀 에르바" }
      };

      const key1 = `${catA}+${catB}`;
      const key2 = `${catB}+${catA}`;
      const matched = compatibilityMatrix[key1] || compatibilityMatrix[key2];

      if (matched) {
        harmonyScore = matched.score;
        title = matched.title;
        mood = matched.mood;
      } else {
        harmonyScore = 88 + ((perfA.name.length + perfB.name.length) % 8);
        title = `${perfA.categoryKo}와 ${perfB.categoryKo}의 조화로운 레이어`;
        mood = "다채로운 노트의 입체적인 매력";
      }

      // Determine heavier base perfume (by longevity/sillage)
      const isAHeavier = (perfA.longevity + perfA.sillage) >= (perfB.longevity + perfB.sillage);
      const basePerf = isAHeavier ? perfA : perfB;
      const topPerf = isAHeavier ? perfB : perfA;

      desc = `무게감이 있는 [${basePerf.nameKo}]의 베이스 노트를 피부 바탕에 깔고, 산뜻한 [${topPerf.nameKo}]을 상단에 얹어 다층적인 향의 실루엣을 완성합니다.`;
      ratioTip = `지속력이 묵직한 <strong>${basePerf.nameKo}</strong>을 목 뒤나 하체에 1회 분사한 뒤, 30초 후 상대적으로 가벼운 <strong>${topPerf.nameKo}</strong>을 쇄골이나 손목에 1~2회 덧뿌려 레이어링하세요.`;
    }

    this.resultBox.innerHTML = `
      <div class="layer-result-card fade-in">
        <div class="layer-header">
          <div class="score-pill">
            <span class="score-val">${harmonyScore}%</span>
            <span class="score-text">조화도 시너지</span>
          </div>
          <div class="recipe-name-box">
            <span class="recipe-badge">CURATED COMBINATION</span>
            <h3 class="recipe-headline">${title}</h3>
            <span class="recipe-mood"><i class="fa-solid fa-wand-magic-sparkles"></i> 무드: ${mood}</span>
          </div>
        </div>

        <div class="duo-preview-grid">
          <div class="duo-item" style="border-left: 3px solid ${perfA.accentColor}">
            <span class="duo-step">BASE 01</span>
            <div class="duo-brand">${perfA.brandKo}</div>
            <div class="duo-name">${perfA.nameKo}</div>
            <div class="duo-notes">${perfA.topNotes[0]} / ${perfA.middleNotes[0]} / ${perfA.baseNotes[0]}</div>
          </div>
          <div class="duo-plus-sign">
            <i class="fa-solid fa-plus"></i>
          </div>
          <div class="duo-item" style="border-left: 3px solid ${perfB.accentColor}">
            <span class="duo-step">LAYER 02</span>
            <div class="duo-brand">${perfB.brandKo}</div>
            <div class="duo-name">${perfB.nameKo}</div>
            <div class="duo-notes">${perfB.topNotes[0]} / ${perfB.middleNotes[0]} / ${perfB.baseNotes[0]}</div>
          </div>
        </div>

        <div class="layer-analysis-body">
          <p class="layer-desc">${desc}</p>
          <div class="ratio-tip-box">
            <div class="tip-icon"><i class="fa-solid fa-spray-can-sparkles"></i></div>
            <div class="tip-text">
              <strong>조향사의 골든 레이어링 룰:</strong> ${ratioTip}
            </div>
          </div>
        </div>

        <div class="layer-actions">
          <button type="button" class="btn btn-outline" onclick="addToDiscoveryKit('${perfA.id}'); addToDiscoveryKit('${perfB.id}');">
            <i class="fa-solid fa-box-archive"></i> 두 향수 모두 시향 키트에 담기
          </button>
          <button type="button" class="btn btn-secondary" onclick="openPerfumeDetail('${perfA.id}')">
            ${perfA.nameKo} 상세
          </button>
          <button type="button" class="btn btn-secondary" onclick="openPerfumeDetail('${perfB.id}')">
            ${perfB.nameKo} 상세
          </button>
        </div>
      </div>
    `;
  }

  renderPresetRecipes() {
    if (!this.recipesContainer) return;

    this.recipesContainer.innerHTML = LAYERING_RECIPES.map(r => {
      const perfA = PERFUMES_DATA.find(p => p.id === r.perfumeA);
      const perfB = PERFUMES_DATA.find(p => p.id === r.perfumeB);
      if (!perfA || !perfB) return "";

      return `
        <div class="preset-recipe-card" onclick="layeringStudio.setSelection('${r.perfumeA}', '${r.perfumeB}')">
          <div class="recipe-top">
            <span class="recipe-score">${r.harmonyScore}% 조화</span>
            <span class="recipe-category">시그니처 조합</span>
          </div>
          <h4 class="recipe-card-title">${r.title}</h4>
          <p class="recipe-perfume-pair">${perfA.nameKo} + ${perfB.nameKo}</p>
          <p class="recipe-card-mood">${r.mood}</p>
          <div class="recipe-card-footer">
            <span>레시피 조합하기 <i class="fa-solid fa-arrow-right"></i></span>
          </div>
        </div>
      `;
    }).join("");
  }
}

// Global layering instance
const layeringStudio = new LayeringStudio();

