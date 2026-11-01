/**
 * L'ATELIER DU PARFUM - Fragrance Quiz Engine
 * 향수 취향 진단 및 맞춤 추천 알고리즘
 */

class PerfumeQuiz {
  constructor() {
    this.currentStep = 0;
    this.answers = {
      vibe: null,
      season: null,
      intensity: null,
      gender: null,
      notes: []
    };
    this.container = document.getElementById("quiz-step-container");
    this.progressBar = document.getElementById("quiz-progress-bar");
    this.stepCounter = document.getElementById("quiz-step-counter");
    this.resultContainer = document.getElementById("quiz-result-container");
  }

  init() {
    this.currentStep = 0;
    this.answers = { vibe: null, season: null, intensity: null, gender: null, notes: [] };
    this.renderCurrentQuestion();
  }

  renderCurrentQuestion() {
    if (!this.container) return;

    // Show quiz container, hide result container
    this.container.classList.remove("hidden");
    if (this.resultContainer) this.resultContainer.classList.add("hidden");

    const totalSteps = QUIZ_QUESTIONS.length;
    const q = QUIZ_QUESTIONS[this.currentStep];

    // Update Progress
    const progressPercent = Math.round(((this.currentStep + 1) / totalSteps) * 100);
    if (this.progressBar) this.progressBar.style.width = `${progressPercent}%`;
    if (this.stepCounter) this.stepCounter.textContent = `질문 ${this.currentStep + 1} / ${totalSteps}`;

    // Render Question Card
    const isMultiple = q.multiple === true;
    const currentAnswer = this.answers[q.id];

    let optionsHtml = q.options
      .map(opt => {
        let isSelected = false;
        if (isMultiple) {
          isSelected = Array.isArray(currentAnswer) && currentAnswer.includes(opt.value);
        } else {
          isSelected = currentAnswer === opt.value;
        }

        return `
          <div 
            class="quiz-option-card ${isSelected ? 'selected' : ''}" 
            data-value="${opt.value}"
            onclick="perfumeQuiz.handleOptionSelect('${q.id}', '${opt.value}', ${isMultiple})"
          >
            <div class="option-icon">${opt.icon || '✨'}</div>
            <div class="option-content">
              <div class="option-label">${opt.label}</div>
              ${opt.desc ? `<div class="option-desc">${opt.desc}</div>` : ''}
            </div>
            <div class="option-check">
              <i class="fa-solid fa-check"></i>
            </div>
          </div>
        `;
      })
      .join("");

    this.container.innerHTML = `
      <div class="quiz-question-wrapper fade-in">
        <div class="question-header">
          <span class="step-badge">STEP 0${this.currentStep + 1}</span>
          <h3 class="question-title">${q.title}</h3>
          <p class="question-subtitle">${q.subtitle}</p>
        </div>

        <div class="options-grid ${isMultiple ? 'options-grid-chips' : ''}">
          ${optionsHtml}
        </div>

        <div class="quiz-nav-actions">
          ${
            this.currentStep > 0
              ? `<button type="button" class="btn btn-outline" onclick="perfumeQuiz.prevStep()"><i class="fa-solid fa-arrow-left"></i> 이전 질문</button>`
              : `<div></div>`
          }
          ${
            isMultiple
              ? `<button type="button" class="btn btn-primary" onclick="perfumeQuiz.nextStep()">다음으로 <i class="fa-solid fa-arrow-right"></i></button>`
              : ``
          }
        </div>
      </div>
    `;
  }

  handleOptionSelect(questionId, value, isMultiple) {
    if (isMultiple) {
      if (!Array.isArray(this.answers[questionId])) {
        this.answers[questionId] = [];
      }
      const idx = this.answers[questionId].indexOf(value);
      if (idx > -1) {
        this.answers[questionId].splice(idx, 1);
      } else {
        if (this.answers[questionId].length >= 3) {
          showToast("핵심 노트는 최대 3개까지 선택할 수 있습니다.");
          return;
        }
        this.answers[questionId].push(value);
      }
      this.renderCurrentQuestion();
    } else {
      this.answers[questionId] = value;
      // Auto advance to next step after brief feedback
      setTimeout(() => {
        this.nextStep();
      }, 250);
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.renderCurrentQuestion();
    }
  }

  nextStep() {
    const q = QUIZ_QUESTIONS[this.currentStep];
    const currentAnswer = this.answers[q.id];

    // Check validation
    if (!currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0)) {
      showToast("옵션을 하나 이상 선택해주세요!");
      return;
    }

    if (this.currentStep < QUIZ_QUESTIONS.length - 1) {
      this.currentStep++;
      this.renderCurrentQuestion();
    } else {
      this.calculateResults();
    }
  }

  calculateResults() {
    const { vibe, season, intensity, gender, notes } = this.answers;
    const selectedVibeObj = QUIZ_QUESTIONS[0].options.find(o => o.value === vibe) || {};
    const selectedVibeTags = selectedVibeObj.tags || [];
    const selectedFamilies = selectedVibeObj.families || [];

    // Calculate match score for all perfumes
    const scoredPerfumes = PERFUMES_DATA.map(perfume => {
      let score = 40; // baseline

      // 1. Vibe & Category Match (Max 25 pts)
      if (selectedFamilies.includes(perfume.category)) {
        score += 15;
      }
      const vibeOverlap = perfume.vibe.filter(v => selectedVibeTags.includes(v)).length;
      score += Math.min(10, vibeOverlap * 5);

      // 2. Season Match (Max 15 pts)
      if (season === "all") {
        score += 12;
      } else if (perfume.season.includes(season)) {
        score += 15;
      }

      // 3. Intensity Match (Max 10 pts)
      if (intensity === "skin" && perfume.longevity <= 3 && perfume.sillage <= 3) {
        score += 10;
      } else if (intensity === "moderate" && perfume.longevity >= 3 && perfume.longevity <= 4) {
        score += 10;
      } else if (intensity === "beast" && (perfume.longevity >= 4 || perfume.sillage >= 4)) {
        score += 10;
      } else {
        score += 5;
      }

      // 4. Gender Nuance Match (Max 10 pts)
      if (gender === "unisex") {
        score += 10;
      } else if (perfume.gender === gender || perfume.gender === "unisex") {
        score += 8;
      }

      // 5. Notes Match (Max 15 pts)
      if (notes && notes.length > 0) {
        const allNotes = [...perfume.topNotes, ...perfume.middleNotes, ...perfume.baseNotes].join(" ");
        let noteBonus = 0;
        notes.forEach(noteKey => {
          if (noteKey === "sandalwood" && (allNotes.includes("샌달우드") || allNotes.includes("백단목") || allNotes.includes("사이프러스"))) noteBonus += 5;
          if (noteKey === "musk" && (allNotes.includes("머스크") || allNotes.includes("암브록스") || allNotes.includes("알데하이드"))) noteBonus += 5;
          if (noteKey === "rose" && (allNotes.includes("로즈") || allNotes.includes("장미") || allNotes.includes("튜베로즈"))) noteBonus += 5;
          if (noteKey === "bergamot" && (allNotes.includes("베르가못") || allNotes.includes("유자") || allNotes.includes("레몬"))) noteBonus += 5;
          if (noteKey === "fig" && (allNotes.includes("무화과") || allNotes.includes("바질") || allNotes.includes("그린"))) noteBonus += 5;
          if (noteKey === "vanilla" && (allNotes.includes("바닐라") || allNotes.includes("통카빈") || allNotes.includes("카카오"))) noteBonus += 5;
          if (noteKey === "tobacco" && (allNotes.includes("타바코") || allNotes.includes("인센스") || allNotes.includes("럼"))) noteBonus += 5;
          if (noteKey === "sea_salt" && (allNotes.includes("솔트") || allNotes.includes("바다") || allNotes.includes("세이지") || allNotes.includes("티"))) noteBonus += 5;
        });
        score += Math.min(15, noteBonus);
      }

      // Random natural fluctuation for authentic feeling
      const pseudoIdHash = perfume.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 5;
      let finalPercent = Math.min(99, Math.max(76, score + pseudoIdHash));

      return {
        ...perfume,
        matchScore: finalPercent
      };
    });

    // Sort descending by matchScore
    scoredPerfumes.sort((a, b) => b.matchScore - a.matchScore);

    this.renderResultScreen(scoredPerfumes);
  }

  renderResultScreen(scoredPerfumes) {
    if (!this.resultContainer || !this.container) return;

    this.container.classList.add("hidden");
    this.resultContainer.classList.remove("hidden");

    const topPerfume = scoredPerfumes[0];
    const runnersUp = scoredPerfumes.slice(1, 4);

    // Build Aura Title based on selections
    let auraName = "고혹적인 벨벳 우디 머스크";
    if (this.answers.vibe === "cozy") auraName = "햇살에 마른 린넨 & 퓨어 소프트 머스크";
    if (this.answers.vibe === "chic") auraName = "고요한 안개 숲 & 딥 샌달우드 오라";
    if (this.answers.vibe === "fresh") auraName = "지중해의 싱그러운 시트러스 & 그린 브리즈";
    if (this.answers.vibe === "sensual") auraName = "미드나잇 앰버 & 매혹적인 럼 타바코";
    if (this.answers.vibe === "romantic") auraName = "새벽 이슬 머금은 럭셔리 로즈 & 화이트 플로럴";

    this.resultContainer.innerHTML = `
      <div class="result-hero-card fade-in">
        <div class="result-badge-pill">
          <i class="fa-solid fa-sparkles"></i> 취향 분석 알고리즘 완료
        </div>
        <h2 class="result-aura-title">당신의 시그니처 향기 오라</h2>
        <div class="result-aura-badge">
          <span>${auraName}</span>
        </div>
        <p class="result-aura-desc">
          선택하신 취향 데이터(무드: <strong>${QUIZ_QUESTIONS[0].options.find(o => o.value === this.answers.vibe)?.label || '시그니처'}</strong>)를
          바탕으로 가장 당신다운 텍스처와 지속력을 완성할 니치 향수를 매칭했습니다.
        </p>

        <!-- Top Match Hero -->
        <div class="top-match-card">
          <div class="match-score-badge">
            <span class="score-number">${topPerfume.matchScore}%</span>
            <span class="score-label">MATCH</span>
          </div>

          <div class="top-match-grid">
            <div class="top-match-visual">
              <div class="perfume-bottle-graphic" style="--bottle-color: ${topPerfume.bottleColor}; --accent-color: ${topPerfume.accentColor};">
                <div class="bottle-cap"></div>
                <div class="bottle-neck"></div>
                <div class="bottle-body">
                  <div class="bottle-label-sticker">
                    <span class="sticker-brand">${topPerfume.brand}</span>
                    <span class="sticker-name">${topPerfume.name}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="top-match-info">
              <div class="brand-tag">${topPerfume.brandKo} · ${topPerfume.categoryKo}</div>
              <h3 class="perfume-title">${topPerfume.nameKo} <span class="en-name">${topPerfume.name}</span></h3>
              <p class="perfume-quote">"${topPerfume.quote}"</p>
              <p class="perfume-story">${topPerfume.story}</p>

              <div class="pyramid-preview">
                <div class="pyramid-item"><strong>TOP:</strong> ${topPerfume.topNotes.slice(0, 3).join(", ")}</div>
                <div class="pyramid-item"><strong>HEART:</strong> ${topPerfume.middleNotes.slice(0, 2).join(", ")}</div>
                <div class="pyramid-item"><strong>BASE:</strong> ${topPerfume.baseNotes.slice(0, 3).join(", ")}</div>
              </div>

              <div class="match-card-actions">
                <button type="button" class="btn btn-primary" onclick="openPerfumeDetail('${topPerfume.id}')">
                  <i class="fa-solid fa-circle-info"></i> 향수 상세 노트 보기
                </button>
                <button type="button" class="btn btn-outline" onclick="addToDiscoveryKit('${topPerfume.id}')">
                  <i class="fa-solid fa-plus"></i> 시향 키트에 담기
                </button>
                <button type="button" class="btn btn-icon" onclick="toggleWishlist('${topPerfume.id}')" title="위시리스트">
                  <i class="fa-regular fa-heart"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 2nd & 3rd Best Matches -->
        <h3 class="runners-up-title"><i class="fa-solid fa-list-check"></i> 함께 추천하는 베스트 대안</h3>
        <div class="runners-up-grid">
          ${runnersUp
            .map(
              p => `
            <div class="runner-card">
              <div class="runner-score">${p.matchScore}% 일치</div>
              <div class="runner-brand">${p.brandKo}</div>
              <div class="runner-name">${p.nameKo}</div>
              <div class="runner-notes">${p.topNotes[0]} · ${p.middleNotes[0]} · ${p.baseNotes[0]}</div>
              <div class="runner-actions">
                <button class="btn btn-sm btn-outline" onclick="openPerfumeDetail('${p.id}')">상세 보기</button>
                <button class="btn btn-sm btn-primary" onclick="addToDiscoveryKit('${p.id}')">+ 키트 담기</button>
              </div>
            </div>
          `
            )
            .join("")}
        </div>

        <!-- Result Controls -->
        <div class="result-bottom-cta">
          <button type="button" class="btn btn-secondary" onclick="perfumeQuiz.init()">
            <i class="fa-solid fa-arrow-rotate-left"></i> 테스트 다시 하기
          </button>
          <button type="button" class="btn btn-outline" onclick="copyResultShareLink('${topPerfume.nameKo}', '${auraName}')">
            <i class="fa-solid fa-share-nodes"></i> 결과 공유하기
          </button>
          <a href="#explore-section" class="btn btn-primary">
            <i class="fa-solid fa-compass"></i> 전체 향수 둘러보기
          </a>
        </div>
      </div>
    `;

    // Scroll smoothly to results
    this.resultContainer.scrollIntoView({ behavior: "smooth" });
  }
}

// Global quiz instance
const perfumeQuiz = new PerfumeQuiz();

