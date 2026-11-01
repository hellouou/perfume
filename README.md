# L'ATELIER DU PARFUM (아틀리에 드 퍼퓸)
> **Where Imagination Meets Fragrance — 나만의 시그니처 향수 맞춤 큐레이션**  
> 🔗 **Live Demo (GitHub Pages):** [https://hellouou.github.io/perfume/](https://hellouou.github.io/perfume/)

---

## 🌟 프로젝트 소개
**L'ATELIER DU PARFUM**은 세련된 **Black & Pink Modern Clean Editorial 테마**를 바탕으로, 사용자의 고유한 분위기, 무드, 선호 계절감, 지속력 취향에 맞춘 최적의 니치 & 럭셔리 향수를 정밀 분석하고 추천하는 인터랙티브 프래그런스 큐레이션 웹 플랫폼입니다.

---

## 🎨 디자인 & 테마 컨셉 (portfolio.pdf 테마 적용)
- **컬러 팔레트**: 딥 피치 블랙(`#000000`, `#0c0c0e`) 베이스와 일렉트릭/파스텔 핑크(`#ffa7e4`, `#ffcbf1`) 액센트의 하이엔드 에디토리얼 무드
- **타이포그래피**: 
  - 헤드라인: 볼드하고 와이드한 레트로 모던 산세리프 (`Syne`, `Space Grotesk`)
  - 감성 포인트: 우아한 필기체 스크립트 서체 (`Pinyon Script`)
  - 본문: 가독성 높은 미니멀 지오메트릭 산세리프 (`Plus Jakarta Sans`)
- **시그니처 비주얼 요소**:
  - `✦` 4-포인트 스파클 스타 모티프 및 실시간 핑크 앰비언트 미스트 캔버스
  - 무한 롤링 마키 티커 배너 (Marquee Ticker Ribbon)
  - 핑크 네온 글로우 버튼 & 다크 글래스모피즘 인터랙티브 카드

---

## ✨ 핵심 기능

### 1. 1분 취향 맞춤 진단기 (Fragrance Finder Quiz)
- **5단계 직관적 취향 설문**:
  1. **Vibe**: 포근한 살냄새, 차분한 시크함, 싱그러운 청량감, 매혹적 관능미, 로맨틱한 우아함
  2. **Season**: 봄, 여름, 가을, 겨울, 사계절 데일리
  3. **Intensity**: 은은한 스킨센트, 스쳐갈 때 풍기는 존재감, 하루 종일 롱래스팅
  4. **Nuance**: 젠더리스(Unisex), 페미닌(Feminine), 마스큘린(Masculine)
  5. **Key Notes**: 샌달우드, 화이트 머스크, 생장미, 베르가못, 무화과잎, 바닐라, 스모키 타바코 등 복수 선택
- **정밀 매칭 결과**: 사용자 고유의 ‘시그니처 향기 오라’ 타이틀, 75%~99% 매칭 일치도, 탑/미들/베이스 노트 시각화 및 베스트 대안 향수 3종 추천.

### 2. 32종 프리미엄 니치 향수 아카이브 (Curated Archive)
- **대표 브랜드 수록**: Diptyque, Le Labo, Byredo, Maison Margiela, Jo Malone, Aesop, Tom Ford, Frederic Malle, Creed 등
- **실시간 스마트 필터**: 8개 향기 패밀리 탭(우디, 플로럴, 시트러스, 머스크 등), 브랜드/노트명 키워드 검색, 계절 및 성별 정렬

### 3. 조향 노트 피라미드 상세 모달 (Scent Pyramid)
- 분사 직후 발현되는 **Top Note**, 30분 이후의 **Heart Note**, 살결에 스며드는 **Base Note** 3단계 입체 시각화
- 조향 스토리텔링 및 나만의 시향 메모 저장(Local Storage 영구 보관)

### 4. 향수 레이어링 조합 연구소 (Scent Layering Studio)
- 두 가지 향수를 선택해 즉시 화학적 시너지 및 궁합 점수(%) 도출
- 조향사의 골든 레이어링 분사 룰(순서, 횟수, 위치) 및 시그니처 듀오 레시피 5선 탑재

### 5. 나만의 3종 시향 키트 (Virtual Discovery Kit) & 위시리스트
- 마음에 드는 향수 3종을 골라 담는 가상 시향 키트 서랍 및 위시리스트 보관함 지원

---

## 📁 디렉토리 구조
```
perfume/
├── index.html          # 메인 페이지 및 인터랙티브 UI 구조
├── README.md           # 프로젝트 문서 및 기능 명세서
├── .gitignore          # 깃 추적 제외 규칙
├── css/
│   └── style.css       # Black & Pink Modern Clean 테마 스타일시트
├── js/
│   ├── data.js         # 32+종 프리미엄 향수 데이터 및 설문/레시피
│   ├── quiz.js         # 5단계 취향 진단 알고리즘 & 결과 분석 엔진
│   ├── layering.js     # 1:1 화학적 향수 레이어링 궁합 분석기
│   └── app.js          # 필터링, 모달, 캔버스 이펙트, 스토리지 제어
└── assets/             # 이미지 및 디자인 에셋
```

---

## 🚀 호스팅 & 배포 안내
- **GitHub Repository**: [https://github.com/hellouou/perfume](https://github.com/hellouou/perfume)
- **GitHub Pages Hosting**: [https://hellouou.github.io/perfume/](https://hellouou.github.io/perfume/)
