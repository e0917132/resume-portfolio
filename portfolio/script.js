// ===== 테마 전환 =====
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');

function currentTheme() {
  if (root.dataset.theme) return root.dataset.theme;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

themeToggle.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
});


// ===== 스크롤 등장 애니메이션 =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el, idx) => {
  el.style.transitionDelay = `${(idx % 4) * 60}ms`;
  revealObserver.observe(el);
});

// ===== 내비게이션: 스크롤 경계선 + 현재 섹션 표시 =====
const nav = document.querySelector('.nav');
const navCurrent = document.getElementById('navCurrent');
const navLinks = [...document.querySelectorAll('.drawer__links a')];
const sections = navLinks.map((a) => document.getElementById(a.dataset.section));

function updateNav() {
  nav.classList.toggle('is-scrolled', window.scrollY > 8);

  const offset = window.innerHeight * 0.35;
  let active = null;
  sections.forEach((sec) => {
    if (sec.getBoundingClientRect().top - offset <= 0) active = sec.id;
  });
  if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) active = 'contact';

  let label = '';
  navLinks.forEach((a) => {
    const on = a.dataset.section === active;
    a.classList.toggle('is-active', on);
    if (on) label = a.lastChild.textContent.trim();
  });
  if (label) navCurrent.textContent = label;
  navCurrent.classList.toggle('is-shown', Boolean(label));
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// ===== 왼쪽 햄버거 메뉴 =====
const drawer = document.getElementById('drawer');
const menuOpen = document.getElementById('menuOpen');

function openMenu() {
  drawer.classList.add('is-open');
  drawer.removeAttribute('inert');
  drawer.setAttribute('aria-hidden', 'false');
  menuOpen.setAttribute('aria-expanded', 'true');
  document.body.classList.add('is-locked');
  (drawer.querySelector('.is-active') || navLinks[0]).focus();
}

function closeMenu() {
  drawer.classList.remove('is-open');
  drawer.setAttribute('inert', '');
  drawer.setAttribute('aria-hidden', 'true');
  menuOpen.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('is-locked');
  menuOpen.focus();
}

menuOpen.addEventListener('click', openMenu);
drawer.addEventListener('click', (e) => {
  if (e.target.closest('[data-close]')) closeMenu();
});
navLinks.forEach((a) => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeMenu();
});

// ===== 프로젝트 필터 =====
const seg = document.querySelector('.seg');
const thumb = seg.querySelector('.seg__thumb');
const segButtons = [...seg.querySelectorAll('button')];
const cards = [...document.querySelectorAll('.card')];

function moveThumb(btn) {
  thumb.style.width = `${btn.offsetWidth}px`;
  thumb.style.transform = `translateX(${btn.offsetLeft}px)`;
}

segButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    segButtons.forEach((b) => b.setAttribute('aria-checked', String(b === btn)));
    moveThumb(btn);
    const filter = btn.dataset.filter;
    cards.forEach((card) => {
      card.classList.toggle('is-hidden', filter !== 'all' && card.dataset.cat !== filter);
    });
  });
});

const initThumb = () => moveThumb(seg.querySelector('[aria-checked="true"]'));
window.addEventListener('resize', initThumb);
document.fonts.ready.then(initThumb);
initThumb();

// ===== 이메일 복사 =====
const toast = document.getElementById('toast');
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-show'), 1800);
}

document.querySelectorAll('button[data-email]').forEach((copyBtn) => {
  copyBtn.addEventListener('click', async () => {
    const email = copyBtn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      copyBtn.classList.add('is-copied');
      showToast('이메일 주소를 복사했습니다');
      setTimeout(() => copyBtn.classList.remove('is-copied'), 1800);
    } catch (e) {
      window.location.href = `mailto:${email}`;
    }
  });
});

// ===== 연락 팝업 =====
const contactModal = document.getElementById('contactModal');
const contactOpen = document.getElementById('contactOpen');

if (contactModal && contactOpen) {
  const openContact = () => {
    contactModal.classList.add('is-open');
    contactModal.removeAttribute('inert');
    contactModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    contactModal.querySelector('.modal__close').focus();
  };

  const closeContact = () => {
    contactModal.classList.remove('is-open');
    contactModal.setAttribute('inert', '');
    contactModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    contactOpen.focus();
  };

  contactOpen.addEventListener('click', openContact);
  contactModal.addEventListener('click', (e) => {
    if (e.target.closest('[data-modal-close]')) closeContact();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contactModal.classList.contains('is-open')) closeContact();
  });
}

// ===== 프로젝트 상세 팝업 =====
// github: 프로젝트별 저장소 주소 (공개 저장소가 생기면 여기만 바꾸면 됩니다)
const PROJECTS = {
  ivf: {
    image: 'assets/ivf.png',
    title: '임신 성공 여부 예측',
    tagline: '난임 시술 기록으로 해당 시술 주기의 임신 성공 여부를 예측하는 모델',
    info: [
      ['기간', '2026.08 — 2026.09'],
      ['인원', '4명 · 4CAST'],
      ['역할', 'LightGBM 모델링 · 튜닝, 재현성 문제 해결, 모델 개발 보고서'],
    ],
    stack: [
      ['모델링', ['LightGBM', 'CatBoost', 'XGBoost', 'Optuna', 'scikit-learn', 'SHAP']],
      ['데이터', ['Python', 'pandas', 'NumPy']],
      ['환경', ['Google Colab']],
    ],
    github: 'https://github.com/e0917132/ivf-pregnancy-prediction',
    goals: [
      '난임 시술 1주기 기록(train 256,351건, 67개 변수)으로 임신 성공 가능성이 높은·낮은 주기를 구분하는 것이 목표',
      '점수 경쟁에 그치지 않고, 성능이 어디서 막히는지까지 설명할 수 있는 모델을 만드는 것',
    ],
    process: [
      ['기획', ['문제 정의', '평가 지표 AUC 설정']],
      ['데이터', ['EDA', '구조적 결측 처리 규칙 정리']],
      ['모델링', ['LightGBM 기준선', 'Optuna 튜닝', '재현성 확보']],
      ['검증 · 정리', ['5-Fold 교차검증', '가중 앙상블', '보고서 · 발표']],
    ],
    highlights: [
      'LightGBM · CatBoost · XGBoost <strong>0.4 : 0.4 : 0.2 가중 앙상블</strong>로 AUC 0.7417 기록',
      '데이터 로딩부터 학습까지 한 번에 다시 실행되는 <strong>재현 가능한 파이프라인</strong>을 만들어, 서로 다른 Colab 환경에서도 같은 점수가 나오는 팀 기준선으로 제공',
      '시술 유형(IVF/DI)에 따라 생기는 구조적 결측 처리 규칙을 표로 문서화해 다른 모델도 같은 전처리 기준을 쓰도록 정리',
      '검증셋 하나에 튜닝이 쏠리는 편향을 줄이려고 <strong>5-Fold 교차검증</strong>(0.7401 ± 0.0017)으로 검증 전략 보완',
      '"이식 배아 수 한 변수가 중요도의 50%", "앙상블 실익이 작다" 등 <strong>핵심 발견 5가지</strong>를 보고서로 정리 → 최종 발표 "TOP 5 주요 분석 결과"로 반영',
    ],
    troubles: [
      {
        title: '같은 설정으로 다시 학습해도 AUC가 매번 달라지는 문제',
        goal: '동일한 코드·설정이면 언제 실행해도 같은 AUC가 나오도록 만들어, 모델 비교와 앙상블 결과를 믿을 수 있게 하기',
        cause: [
          'Colab 셀을 반복 실행하면서 이미 가공된 데이터에 전처리가 다시 적용됨',
          'LightGBM 멀티스레드 연산이 비결정적으로 동작',
          '학습용 Dataset 객체가 재사용됨',
          'Optuna study가 이전 결과에 이어 붙음',
        ],
        fix: [
          '항상 원본 CSV부터 다시 시작하는 <code>reset_data()</code> 함수',
          '<code>deterministic=True</code> · <code>force_row_wise=True</code> · 스레드 수 고정',
          'Dataset을 학습마다 새로 생성',
          'Optuna study를 함수 안에서 매번 새로 생성',
        ],
        result: '동일 설정 3회 반복 학습에서 AUC가 모두 <strong>0.737210</strong>, 표준편차 <strong>0</strong>으로 완전히 재현',
      },
    ],
  },
  esight: {
    image: 'assets/esight.png',
    title: '멀티모달 AI를 활용한 동물병원 판독 자동화 및 보호자 맞춤 설명문 제공 서비스',
    tagline: 'X-ray · 혈액검사 · 투약 기록을 묶어 수의사에게는 판독 초안을, 보호자에게는 쉬운 설명문을 제공하는 구독형 서비스 기획',
    info: [
      ['기간', '2026.09 — 2026.10 (2주)'],
      ['인원', '5명 · E-Sight'],
      ['역할', '특성요인도 · 변수정의서 · 분석계획서 설계, 최종 발표 1부(추진배경 · 서비스 제안)'],
    ],
    stack: [
      ['분석', ['Python', 'pandas', 'SciPy', 'Matplotlib']],
      ['기획', ['특성요인도', '수집성 평가표', '변수정의서']],
      ['데이터', ['AI Hub 반려동물 근골격계 X-ray']],
    ],
    github: 'https://github.com/e0917132/esight-veterinary-xray-service',
    goals: [
      '동물병원 X-ray 판독 AI의 계약 갱신율 하락(94% → 81%) 문제를 해결하기 위해 기획',
      '보호자 불만의 큰 축인 "정보 · 설명 부족"(33.5%)을 판독 결과 설명문으로 줄이고, 실데이터로 서비스 필요성을 검증하는 것이 목표',
    ],
    process: [
      ['기획', ['문제 정의', '특성요인도 528개 인자']],
      ['설계', ['수집성 평가(1 · 3 · 9점)', '변수정의서 · 분석계획서']],
      ['분석', ['실데이터 19개 변수 분석', '데이터 결합 구조 시연']],
      ['발표', ['1부 왜 필요한가', '2부 데이터로 확인']],
    ],
    highlights: [
      '영상 · 혈액검사 · 처방 · 개체 정보 · 법규제 등 <strong>11개 영역 528개 인자</strong>를 특성요인도로 정리',
      '"중요도 × 확보 용이성"을 <strong>1 · 3 · 9점</strong>으로 평가하는 표를 팀 공통 기준으로 만들어 <strong>104개 즉시 착수 인자</strong>에 합의',
      '변수정의서 · 분석계획서를 먼저 확정해, 통계 분석과 데이터 결합 구조 시연이 같은 변수 정의 위에서 병렬로 진행되도록 조율',
      '실데이터 분석으로 "질환군별 이상률 <strong>최대 150배</strong> 차이", "대형 병원 간 판정률 <strong>최대 3.8배</strong> 차이"라는 서비스 근거 확보',
      '발표를 1부 "왜 필요한가"(담당)와 2부 "데이터로 확인했다"로 나누고 하나의 흐름으로 구성',
    ],
    troubles: [
      {
        title: '계획한 인자 대부분이 실데이터에 없던 문제',
        goal: '설계한 104개 즉시 착수 인자로 서비스 필요성을 데이터로 검증하기',
        cause: [
          'AI Hub 라벨 16,618건을 받아 보니 바로 분석할 수 있는 변수는 <strong>12개</strong>뿐',
          '품종 · 체중은 아예 없고, 서비스 핵심인 혈액검사 · 투약 기록도 없음',
        ],
        fix: [
          '목표 변수(이상소견 여부)와 층별화 변수(질환군 · 축종 · 성별 · 나이 · 병원 등) <strong>19개</strong>로 분석 범위를 다시 설계',
          '없는 혈액 · 투약 기록은 실제 라벨 파일명 형식에 맞춘 가상 데이터로 만들어 "결합 구조가 작동하는지"만 검증 (수치는 결론에 쓰지 않음)',
          '528개 인자 설계는 서비스 확장 시 데이터 로드맵으로 유지',
        ],
        result: '2주 안에 실데이터 근거와 결합 구조 시연을 모두 갖춘 최종 발표 완성',
      },
      {
        title: '모든 변수가 "유의"하게 나오고, 관련 없는 변수가 강해 보인 문제',
        goal: '이상소견과 실제로 관련 있는 변수만 골라 서비스 근거로 쓰기',
        cause: [
          '표본이 1만 6천 건으로 커서 아주 작은 차이도 p-value가 유의하게 나옴',
          '"촬영 자세"가 이상소견과 강하게 관련돼 보였지만, 질환군마다 촬영 자세가 거의 정해져 있어 생긴 <strong>교란</strong>',
        ],
        fix: [
          'p-value 대신 관련 강도를 0~1로 보여주는 <strong>크래머 V</strong>로 변수 비교',
          '질환군 안에서 자세별 이상률을 다시 나눠 보고, 촬영 자세는 결론에서 제외',
        ],
        result: '질환군(V=0.513) · 병원(V=0.219)처럼 실제로 의미 있는 변수만 서비스 근거로 채택',
      },
    ],
  },
  xray: {
    image: 'assets/xray.png',
    dark: true,
    title: '흉부 X-ray 폐렴 분류',
    tagline: '소아 흉부 X-ray를 정상과 폐렴으로 분류하고, 검증 점수와 실제 점수의 격차를 분석한 딥러닝 프로젝트',
    info: [
      ['기간', '2026.10'],
      ['인원', '개인 프로젝트'],
      ['결과', '리더보드 정확도 0.8782 (Baseline 0.75 대비 +80장)'],
    ],
    stack: [
      ['모델링', ['PyTorch', 'torchvision', 'ResNet50', 'DenseNet121', 'EfficientNet-B0', 'Optuna']],
      ['분석', ['Grad-CAM', 'scikit-learn', 'SciPy', 'pandas', 'Matplotlib']],
      ['환경', ['Apple Silicon (MPS)']],
    ],
    github: 'https://github.com/e0917132/pneumonia_classification_project',
    goals: [
      '소아 흉부 X-ray(train 5,216장 / test 624장)로 Baseline 0.75를 넘는 폐렴 분류 모델 개발',
      '"검증 0.99인데 실제는 0.84"인 이유를 찾아, 검증 점수를 믿을 수 있는지부터 확인하는 것이 목표',
    ],
    process: [
      ['기준선', ['Baseline 분석', '평가 방식 정비(5-fold OOF)']],
      ['원인 탐색', ['누수 점검', '분포 · 프레이밍 차이 확인']],
      ['실험', ['여백 크롭', '모델 비교 · 앙상블', 'McNemar 검정']],
      ['해석 · 정리', ['실패 사례 · Grad-CAM', '위험도 3단계 설계', '보고서 · README']],
    ],
    highlights: [
      '최종 ResNet50 5-fold 모델로 리더보드 정확도 <strong>0.8782</strong> (Baseline 0.75 대비 +80장)',
      '14개 실험을 실험 기록표로 관리하고, 실험 간 차이를 <strong>McNemar 검정</strong>으로 비교 → 개선 파이프라인은 Baseline보다 유의하게 나았지만(p≈10⁻³⁵) 이후 모델 교체 · 앙상블 · 튜닝은 유의한 차이가 없음을 확인',
      '<strong>Grad-CAM</strong>으로 모델이 폐 바깥의 단서(어깨, 촬영 표시, 가장자리)를 보는 경향 발견',
      '서비스 확장을 위해 이미지별 결과 데이터와 판독 우선순위용 <strong>위험도 3단계</strong>(Low / Medium / High) 설계',
      'README · 최종 보고서 · 미션별 문서로 누구나 같은 순서로 재현할 수 있게 저장소 구성',
    ],
    troubles: [
      {
        title: '검증 0.99 vs 리더보드 0.84 — 입력 프레이밍 차이',
        goal: '검증 점수와 실제 점수의 격차 원인을 찾아 줄이기',
        cause: [
          '먼저 최고 epoch 선택으로 점수가 부풀려졌는지 의심 → 12 epoch 고정 · 5-fold OOF로 다시 평가했지만 차이는 0.001뿐',
          'train과 test 이미지를 직접 비교 → train은 정사각형에 검은 여백이 있어 내용 비율 <strong>0.663</strong>, test는 여백 없이 <strong>0.953</strong>',
        ],
        fix: [
          '임계값(T=10)을 train에서만 정한 <strong>검은 여백 크롭</strong>을 train · test에 같은 규칙으로 적용 → train 내용 비율 0.927',
          '밝기 · 대비 보정도 시도했지만 오판정이 늘어(13장 → 18장) 채택하지 않음',
        ],
        result: '리더보드 <strong>0.8622 → 0.8766</strong> (9장 개선)',
      },
      {
        title: '검증 1등 앙상블이 리더보드 꼴찌인 문제',
        goal: '검증 점수가 가장 높은 모델이 실제로도 가장 나은지 확인하기',
        cause: [
          'ResNet18 + DenseNet121 앙상블은 OOF <strong>0.9912</strong>(중첩 검증 0.9902)로 1등, 리더보드는 <strong>0.8429</strong>로 꼴찌',
          '기준 모델과 비교해 test 예측이 바뀐 방향을 집계 → 폐렴 판정을 늘린 변경은 바뀐 장수만큼 점수가 떨어짐',
        ],
        fix: [
          '리더보드에 맞춰 임계값을 바꾸지 않고 <strong>0.5로 고정</strong>',
          '실패 사례 분석과 Grad-CAM으로 원인을 추적',
        ],
        result: '검증 점수만으로 모델을 고르지 않는 기준을 세우고, 최종 모델은 단일 ResNet50 5-fold로 결정 (리더보드 0.8782)',
      },
    ],
  },
  aihealth: {
    image: 'assets/ai-health-web.png',
    title: 'AI 폐렴 진단 지원 시스템',
    tagline: '흉부 X-ray를 업로드하면 AI가 폐렴 여부를 예측해 의료진의 판독을 돕는 FastAPI 웹 서비스',
    info: [
      ['기간', '2026.10.21 — 2026.10.29'],
      ['인원', '3명 · 5조 (김새봄 · 김민정 · 전은지)'],
      ['역할', 'DB 모델 · 마이그레이션, 마이페이지 · 환자 · AI 결과 API, 명세서 검토, AI 모델 평가, 전체 흐름 검증'],
    ],
    stack: [
      ['백엔드', ['FastAPI', 'SQLAlchemy (async)', 'Alembic', 'Pydantic', 'PyJWT', 'Argon2']],
      ['데이터 · AI', ['MySQL 8', 'PyTorch', 'torchvision (ResNet18)']],
      ['환경 · 협업', ['Docker Compose', 'Swagger', 'GitHub PR', 'HTML/CSS/JS']],
    ],
    github: 'https://github.com/qkcnzkvh/AH_web_development_5team',
    goals: [
      '회원 · 환자 · 진료기록 · X-ray 이미지 · AI 분석 결과를 하나의 흐름으로 관리하는 의료 지원 웹 서비스 구현',
      '파트를 나눠 개발하면서도 명세서와 실제 동작이 어긋나지 않도록, 통합 검증까지 마치는 것이 목표',
    ],
    process: [
      ['설계', ['ERD 검토', 'DB 모델 · Alembic 마이그레이션']],
      ['API 구현', ['마이페이지 · 개인정보 API', '환자 등록 · 수정 · 삭제 API']],
      ['AI 연동', ['AI 모델 평가 스크립트', 'AI 결과 목록 API · 화면 연동']],
      ['검증', ['명세서 검토 · 수정안', 'Swagger · 전체 흐름 검증']],
    ],
    highlights: [
      '<code>XrayImage</code> · <code>AiAnalysisResult</code> 모델과 <strong>Alembic 초기 마이그레이션</strong>을 작성하고, ERD의 FK 타입 불일치 · 제약 조건 충돌 · Enum 미적용을 찾아 수정 제안',
      '마이페이지 조회 · 회원 정보 수정 · 비밀번호 변경 · 회원 탈퇴 API를 <strong>apis / services / repositories / schemas 계층</strong>으로 나눠 설계 · 구현',
      '환자 정보 등록 · 수정 · 삭제 API와 AI 폐렴 예측 결과 목록 API를 구현하고, 프론트에 "분석 중…" 표시 · 중복 클릭 방지 · Heatmap 열 추가',
      'API 경로 <code>/api/v1</code> 통일, 휴대폰 번호 형식 통일, 공통 함수를 <code>app/core/security.py</code>로 모으는 등 <strong>팀 공통 규칙</strong> 제안',
      '화면이 호출하는 엔드포인트 20개를 점검하고, 회원가입부터 AI 예측 · 회원 탈퇴까지 <strong>36개 항목 전체 흐름 통과</strong>(모든 응답 0.15초 이내) 확인',
    ],
    troubles: [
      {
        title: '공통 인증 모듈이 없어 다른 파트 API가 실행되지 않던 문제',
        goal: 'A · B · C · D 파트가 각자 만든 API가 하나의 서비스로 함께 동작하게 하기',
        cause: [
          '<code>security.py</code>에 JWT 설정과 라우터 등록이 없어 User API가 실행되지 않음',
          '해시 함수와 <code>get_current_user</code>를 파트마다 따로 만들어 쓰고 있었음',
        ],
        fix: [
          '공통 인증 모듈(<code>security</code> · <code>validators</code>)을 분리하고 Timestamp 기본값 버그를 함께 수정',
          '공통 모듈 PR을 먼저 머지하고 각 파트가 같은 곳에서 import하도록 제안',
          '완료 코드를 Swagger로 전체 검증해 실패한 D 파트 3건을 찾아 수정',
        ],
        result: 'Swagger 검증 <strong>37개 항목 중 34개 → 37/37 통과</strong>',
      },
      {
        title: 'DB 설계의 FK 타입 · 제약 조건 충돌',
        goal: 'Alembic 초기 마이그레이션이 오류 없이 생성 · 적용되게 하기',
        cause: [
          '<code>users.id</code>(integer)와 <code>xray_images.uploader_id</code>(bigint)의 타입 불일치 — MySQL은 FK 타입이 같아야 함',
          '<code>uploader_id</code>가 NOT NULL인데 ON DELETE SET NULL로 지정돼 서로 충돌',
          '<code>patients.gender</code>가 Enum이 아님',
        ],
        fix: [
          '<code>users.id</code>를 BigInteger로 통일',
          '<code>uploader_id</code>를 NULL 허용으로 변경',
          '<code>patients.gender</code>를 Enum(Gender)으로 수정',
        ],
        result: '모델을 <code>app/models/__init__.py</code>에 연결하고 초기 마이그레이션 생성 · 검증 완료',
      },
      {
        title: 'AI 모델을 평가할 정답 데이터가 없던 문제',
        goal: '배포 전에 AI 모델이 요구사항 기준(NFR-PRED-001)을 넘는지 확인하기',
        cause: [
          '대회 test 데이터는 정답 라벨이 없어(전부 0) 평가에 쓸 수 없음',
          '비기능 요구사항이라 API로 만들 대상이 아님',
        ],
        fix: [
          '배포 전 평가 스크립트(<code>worker/evaluate.py</code>)를 만들고, 서비스와 같은 <code>predict_pneumonia</code>로 평가해 전처리 · 판정 방식을 일치',
          '학습 노트북과 같은 검증 분할(stratify 8:2, <code>random_state=42</code>)로 <strong>1,044장</strong>을 재구성해 평가',
        ],
        result: 'Recall <strong>0.9910</strong> · Accuracy <strong>0.9904</strong>로 기준 통과, 평가 결과를 문서로 기록',
      },
    ],
  },
};

const projectModal = document.getElementById('projectModal');
const pmBody = document.getElementById('pmBody');
let lastCard = null;

function renderSec(num, title, body) {
  return `
      <section class="pm__sec">
        <h3 class="pm__sec-title"><span class="pm__sec-num">${num}</span>${title}</h3>
        ${body}
      </section>`;
}

const list = (items, cls = 'pm__list') => `<ul class="${cls}">${items.map((t) => `<li>${t}</li>`).join('')}</ul>`;

function renderIntro(p) {
  return `
        <div class="pm__intro">
          <dl class="pm__info">
            ${p.info.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
          </dl>
          <div class="pm__stack">
            ${p.stack.map(([k, tags]) => `<div><span>${k}</span><ul class="tags">${tags.map((t) => `<li>${t}</li>`).join('')}</ul></div>`).join('')}
          </div>
          <a class="pm__link" href="${p.github}" target="_blank" rel="noopener noreferrer">
            ${GH_ICON}<span>${p.github.replace('https://', '')}</span>
          </a>
        </div>
        ${list(p.goals, 'pm__list pm__list--goal')}`;
}

function renderProcess(p) {
  return `<ol class="pm__flow">${p.process.map(([phase, steps]) => `
          <li><span class="pm__phase">${phase}</span>${steps.map((t) => `<p>${t}</p>`).join('')}</li>`).join('')}
        </ol>`;
}

function renderTrouble(t, i, n) {
  return `
        <article class="pm__ts">
          <h4 class="pm__ts-title">${n > 1 ? `<span>${i + 1}</span>` : ''}${t.title}</h4>
          <div class="pm__ts-row"><b>목표</b><p>${t.goal}</p></div>
          <div class="pm__ts-row"><b>원인</b>${list(t.cause)}</div>
          <div class="pm__ts-row"><b>해결</b>${list(t.fix)}</div>
          <div class="pm__ts-row pm__ts-row--result"><b>결과</b><p>${t.result}</p></div>
        </article>`;
}

const GH_ICON = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';

function renderProject(p) {
  return `
    <div class="pm__media${p.dark ? ' pm__media--dark' : ''}"><img src="${p.image}" alt=""></div>
    <div class="pm__body">
      <h2 class="pm__title" id="pmTitle">${p.title}</h2>
      <p class="pm__summary">${p.tagline}</p>
      ${renderSec('01', '프로젝트 소개', renderIntro(p))}
      ${renderSec('02', '프로젝트 진행 순서', renderProcess(p))}
      ${renderSec('03', '주요 내용', list(p.highlights))}
      ${renderSec('04', '트러블 슈팅', p.troubles.map((t, i) => renderTrouble(t, i, p.troubles.length)).join(''))}

      <div class="pm__actions">
        <a class="btn btn--solid" href="${p.github}" target="_blank" rel="noopener noreferrer">${GH_ICON} GitHub에서 보기</a>
        <button type="button" class="btn btn--ghost" data-modal-close>닫기</button>
      </div>
    </div>`;
}

function openProject(card) {
  const p = PROJECTS[card.dataset.project];
  if (!p) return;
  lastCard = card;
  pmBody.innerHTML = renderProject(p);
  projectModal.querySelector('.modal__panel').scrollTop = 0;
  projectModal.classList.add('is-open');
  projectModal.removeAttribute('inert');
  projectModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-locked');
  projectModal.querySelector('.modal__close').focus();
}

function closeProject() {
  projectModal.classList.remove('is-open');
  projectModal.setAttribute('inert', '');
  projectModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('is-locked');
  if (lastCard) lastCard.focus();
}

cards.forEach((card) => {
  card.addEventListener('click', () => openProject(card));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProject(card); }
  });
});
projectModal.addEventListener('click', (e) => {
  if (e.target.closest('[data-modal-close]')) closeProject();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && projectModal.classList.contains('is-open')) closeProject();
});
