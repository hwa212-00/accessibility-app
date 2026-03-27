// --- 기존 하단 탭 로직 ---
const tabs = document.querySelectorAll('[role="tab"]');
const tabList = document.querySelector('[role="tablist"]');
let tabFocus = 0; 

tabList.addEventListener('keydown', (e) => {
    if (e.keyCode === 39 || e.keyCode === 37) {
        tabs[tabFocus].setAttribute('tabindex', -1);
        if (e.keyCode === 39) { tabFocus++; if (tabFocus >= tabs.length) tabFocus = 0; } 
        else if (e.keyCode === 37) { tabFocus--; if (tabFocus < 0) tabFocus = tabs.length - 1; }
        tabs[tabFocus].setAttribute('tabindex', 0);
        tabs[tabFocus].focus();
    }
});

tabs.forEach((tab, index) => {
    tab.addEventListener('click', (e) => { tabFocus = index; changeTab(e); });
});

function changeTab(e) {
    const targetTab = e.currentTarget;
    const targetPanelId = targetTab.getAttribute('aria-controls');
    const tabName = targetTab.querySelector('.tab-label').textContent;
    const headerTitleArea = document.getElementById('header-title');

    if (targetPanelId === 'home') {
        headerTitleArea.innerHTML = `<a href="#home" class="logo" onclick="document.getElementById('tab-home').click(); return false;">HWA</a>`;
    } else {
        headerTitleArea.innerHTML = tabName;
    }

    tabs.forEach(t => { t.setAttribute('aria-selected', "false"); t.setAttribute('tabindex', -1); });
    document.querySelectorAll('[role="tabpanel"]').forEach(p => { p.classList.remove('active'); });

    targetTab.setAttribute('aria-selected', "true");
    targetTab.setAttribute('tabindex', 0); 
    document.getElementById(targetPanelId).classList.add('active');
}

// --- 기존 로그인 폼 로직 ---
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('user-email');
const emailError = document.getElementById('email-error');

if(loginForm) { 
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        if (!emailInput.value.includes('@')) {
            emailInput.setAttribute('aria-invalid', 'true');
            emailError.removeAttribute('hidden');
            emailInput.focus(); 
        } else {
            emailInput.setAttribute('aria-invalid', 'false');
            emailError.setAttribute('hidden', 'true');
            alert('접근성 100% 폼 제출 성공!');
        }
    });
}

// === [추가됨] 알림 모달창 접근성 제어 로직 ===
const notiBtn = document.getElementById('noti-btn');
const notiModal = document.getElementById('noti-modal');
const closeBtn = document.getElementById('noti-close-btn');
let lastFocusedElement; // 모달이 닫힐 때 포커스를 되돌려줄 이전 요소를 기억할 변수

function openModal() {
    lastFocusedElement = document.activeElement; // 모달을 연 버튼 기억해두기
    notiModal.classList.add('active');
    
    // 접근성 속성 업데이트
    notiModal.setAttribute('aria-hidden', 'false');
    notiBtn.setAttribute('aria-expanded', 'true');
    
    // 모달이 열리면 포커스를 내부 닫기 버튼으로 즉시 이동 (KWCAG 필수)
    closeBtn.focus(); 
    
    // 🚧 수칙 4번 적용: 배포 전 삭제 리마인드
    console.log('[Dev] 알림 모달이 열렸습니다. 작업이 끝나면 이 console.log를 꼭 지워주세요!');
}

function closeModal() {
    notiModal.classList.remove('active');
    
    // 접근성 속성 원래대로 복구
    notiModal.setAttribute('aria-hidden', 'true');
    notiBtn.setAttribute('aria-expanded', 'false');
    
    // 모달 닫히면 원래 있던 종 모양 버튼으로 포커스 복귀 (KWCAG 필수)
    if(lastFocusedElement) {
        lastFocusedElement.focus();
    }
}

if(notiBtn) notiBtn.addEventListener('click', openModal);
if(closeBtn) closeBtn.addEventListener('click', closeModal);

// 모달 바깥 어두운 영역(Dimmed) 클릭 시 닫기
window.addEventListener('click', (e) => {
    if (e.target === notiModal) {
        closeModal();
    }
});

// 키보드 ESC 키 누르면 닫기 (키보드 접근성 필수)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && notiModal.classList.contains('active')) {
        closeModal();
    }
});