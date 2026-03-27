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

// === [수정됨] 알림 팝업 및 완벽한 초점 트랩 (Focus Trap) 로직 ===
const notiBtn = document.getElementById('noti-btn');
const notiModal = document.getElementById('noti-modal');
const closeBtn = document.getElementById('noti-close-btn');
let lastFocusedElement; 

function openModal() {
    lastFocusedElement = document.activeElement; 
    notiModal.classList.add('active');
    
    notiModal.setAttribute('aria-hidden', 'false');
    notiBtn.setAttribute('aria-expanded', 'true');
    closeBtn.focus(); 
    
    // 🚧 배포 전 삭제 리마인드
    console.log('[Dev] 알림 팝업이 열렸습니다. 작업이 끝나면 이 console.log를 꼭 지워주세요!');
}

function closeModal() {
    notiModal.classList.remove('active');
    
    notiModal.setAttribute('aria-hidden', 'true');
    notiBtn.setAttribute('aria-expanded', 'false');
    
    if(lastFocusedElement) {
        lastFocusedElement.focus();
    }
}

if(notiBtn) notiBtn.addEventListener('click', openModal);
if(closeBtn) closeBtn.addEventListener('click', closeModal);

window.addEventListener('click', (e) => {
    if (e.target === notiModal) {
        closeModal();
    }
});

// 키보드 제어: ESC 닫기 & Focus Trap (초점 가두기)
notiModal.addEventListener('keydown', function(e) {
    // ESC 닫기
    if (e.key === 'Escape') {
        closeModal();
        return;
    }

    // Tab 키 초점 트랩 로직
    const isTabPressed = e.key === 'Tab' || e.keyCode === 9;
    if (!isTabPressed) return;

    // 팝업 안에서 초점을 받을 수 있는 모든 요소 찾기
    const focusableElements = notiModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) { // Shift + Tab 누를 때
        if (document.activeElement === firstElement) {
            lastElement.focus(); // 첫 요소면 마지막으로 보냄
            e.preventDefault();
        }
    } else { // Tab 누를 때
        if (document.activeElement === lastElement) {
            firstElement.focus(); // 마지막 요소면 처음으로 보냄
            e.preventDefault();
        }
    }
});