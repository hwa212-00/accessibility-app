// --- 기본 탭 및 폼 로직 ---
const tabs = document.querySelectorAll('[role="tab"]');
const tabList = document.querySelector('[role="tablist"]');
let tabFocus = 0; 
tabList.addEventListener('keydown', (e) => {
    if (e.keyCode === 39 || e.keyCode === 37) {
        tabs[tabFocus].setAttribute('tabindex', -1);
        if (e.keyCode === 39) { tabFocus++; if (tabFocus >= tabs.length) tabFocus = 0; } 
        else if (e.keyCode === 37) { tabFocus--; if (tabFocus < 0) tabFocus = tabs.length - 1; }
        tabs[tabFocus].setAttribute('tabindex', 0); tabs[tabFocus].focus();
    }
});
tabs.forEach((tab, index) => { tab.addEventListener('click', (e) => { tabFocus = index; changeTab(e); }); });
function changeTab(e) {
    const targetTab = e.currentTarget;
    const targetPanelId = targetTab.getAttribute('aria-controls');
    const headerTitleArea = document.getElementById('header-title');
    if (targetPanelId === 'home') { headerTitleArea.innerHTML = `<a href="#home" class="logo" onclick="document.getElementById('tab-home').click(); return false;">HWA</a>`; } 
    else { headerTitleArea.innerHTML = targetTab.querySelector('.tab-label').textContent; }
    tabs.forEach(t => { t.setAttribute('aria-selected', "false"); t.setAttribute('tabindex', -1); });
    document.querySelectorAll('[role="tabpanel"]').forEach(p => { p.classList.remove('active'); });
    targetTab.setAttribute('aria-selected', "true"); targetTab.setAttribute('tabindex', 0); 
    document.getElementById(targetPanelId).classList.add('active');
}
const loginForm = document.getElementById('login-form');
if(loginForm) { 
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        const emailInput = document.getElementById('user-email');
        if (!emailInput.value.includes('@')) {
            emailInput.setAttribute('aria-invalid', 'true'); document.getElementById('email-error').removeAttribute('hidden'); emailInput.focus(); 
        } else {
            emailInput.setAttribute('aria-invalid', 'false'); document.getElementById('email-error').setAttribute('hidden', 'true'); alert('접근성 100% 폼 제출 성공!');
        }
    });
}

// === 공통: 포커스 트랩(초점 가두기) 함수 ===
function trapFocus(element, event) {
    const isTabPressed = event.key === 'Tab' || event.keyCode === 9;
    if (!isTabPressed) return;

    const focusableElements = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) { 
        if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
        }
    } else { 
        if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
        }
    }
}

// === 알림 드롭다운 제어 ===
const notiBtn = document.getElementById('noti-btn');
const notiModal = document.getElementById('noti-modal');
const closeBtn = document.getElementById('noti-close-btn');
let lastFocusedBeforeNoti; 

function openNoti() {
    lastFocusedBeforeNoti = document.activeElement; 
    notiModal.classList.add('active');
    notiModal.setAttribute('aria-hidden', 'false');
    notiBtn.setAttribute('aria-expanded', 'true');
    closeBtn.focus(); 
}

function closeNoti() {
    notiModal.classList.remove('active');
    notiModal.setAttribute('aria-hidden', 'true');
    notiBtn.setAttribute('aria-expanded', 'false');
    if(lastFocusedBeforeNoti) lastFocusedBeforeNoti.focus();
}

if(notiBtn) notiBtn.addEventListener('click', openNoti);
if(closeBtn) closeBtn.addEventListener('click', closeNoti);

notiModal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeNoti(); return; }
    trapFocus(notiModal, e);
});

// === 상세 팝업 제어 및 상태 업데이트 로직 ===
const detailPopup = document.getElementById('detail-popup');
const popupCloseBtn = document.getElementById('popup-close-btn');
const notiItems = document.querySelectorAll('.noti-item');
let lastFocusedNotiItem; 

function openPopup() {
    detailPopup.classList.add('active');
    detailPopup.setAttribute('aria-hidden', 'false');
    popupCloseBtn.focus(); 
}

function closePopup() {
    detailPopup.classList.remove('active');
    detailPopup.setAttribute('aria-hidden', 'true');
    if(lastFocusedNotiItem) lastFocusedNotiItem.focus(); 
}

// 각 알림 항목 클릭 이벤트
notiItems.forEach(item => {
    item.addEventListener('click', (e) => {
        lastFocusedNotiItem = e.currentTarget;
        
        // [추가됨] 안 읽은 상태(unread)일 경우 실시간으로 읽음(read) 처리
        if (lastFocusedNotiItem.classList.contains('unread')) {
            // 1. 클래스 교체로 시각적 스타일(굵기, 색상) 변경
            lastFocusedNotiItem.classList.remove('unread');
            lastFocusedNotiItem.classList.add('read');
            
            // 2. 스크린 리더 텍스트를 '읽음'으로 교체
            const srText = lastFocusedNotiItem.querySelector('.status-text');
            if (srText) srText.textContent = '읽음';
            
            // 3. 레드닷 시각적 숨김 처리 (DOM 삭제 시 포커스 에러 방지)
            const redDot = lastFocusedNotiItem.querySelector('.red-dot');
            if (redDot) redDot.style.display = 'none';
        }

        openPopup();
    });
});

if(popupCloseBtn) popupCloseBtn.addEventListener('click', closePopup);

detailPopup.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closePopup(); return; }
    trapFocus(detailPopup, e);
});

// 배경 클릭 시 닫기
window.addEventListener('click', (e) => {
    if (e.target === notiModal) closeNoti();
    if (e.target === detailPopup) closePopup();
});

// 🚧 수칙 4번: 배포 전 리마인드
console.log('[Dev] 보안 우선: RLS 적용 확인. 알림 읽음 처리 API 연동 후 이 콘솔을 지워주세요.');