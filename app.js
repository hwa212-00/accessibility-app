// 1. 공통 유틸리티 함수 설정 (중복 코드 제거)
function setupTabKeyboardNav(listSelector, tabsSelector) {
    const tabList = document.querySelector(listSelector);
    const tabs = document.querySelectorAll(tabsSelector);
    if (!tabList || tabs.length === 0) return;
    let focusIdx = 0;
    tabList.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            tabs[focusIdx].setAttribute('tabindex', '-1');
            if (e.key === 'ArrowRight') focusIdx = (focusIdx + 1) % tabs.length;
            else if (e.key === 'ArrowLeft') focusIdx = (focusIdx - 1 + tabs.length) % tabs.length;
            tabs[focusIdx].setAttribute('tabindex', '0');
            tabs[focusIdx].focus();
        }
    });
}

function trapFocus(element, event) {
    if (event.key !== 'Tab') return;
    const focusable = element.querySelectorAll('button, a, input, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { last.focus(); event.preventDefault(); }
    else if (!event.shiftKey && document.activeElement === last) { first.focus(); event.preventDefault(); }
}

function handleModalToggle(modalId, triggerBtnId, closeBtnId, isOpen, prevFocusEl) {
    const modal = document.getElementById(modalId);
    const triggerBtn = document.getElementById(triggerBtnId);
    const closeBtn = document.getElementById(closeBtnId);
    if(!modal) return;

    if (isOpen) {
        modal.classList.add('active'); modal.setAttribute('aria-hidden', 'false');
        if (triggerBtn) triggerBtn.setAttribute('aria-expanded', 'true');
        if (closeBtn) closeBtn.focus();
    } else {
        modal.classList.remove('active'); modal.setAttribute('aria-hidden', 'true');
        if (triggerBtn) triggerBtn.setAttribute('aria-expanded', 'false');
        if (prevFocusEl) prevFocusEl.focus();
    }
}

// 2. 탭 기능 및 키보드 네비게이션 적용
setupTabKeyboardNav('.bottom-nav', '.bottom-nav [role="tab"]');
setupTabKeyboardNav('.kwcag-tablist', '.kwcag-tab');

// 하단 메인 탭 로직
const mainTabs = document.querySelectorAll('.bottom-nav [role="tab"]');
mainTabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
        const targetTab = e.currentTarget;
        const targetId = targetTab.getAttribute('aria-controls');
        const titleArea = document.getElementById('header-title');
        
        if (targetId === 'home') titleArea.innerHTML = `<a href="#home" class="logo" onclick="document.getElementById('tab-home').click(); return false;">HWA</a>`;
        else titleArea.innerHTML = targetTab.querySelector('.tab-label').textContent;
        
        mainTabs.forEach(t => { t.setAttribute('aria-selected', "false"); t.setAttribute('tabindex', "-1"); });
        document.querySelectorAll('.tab-content').forEach(p => p.classList.remove('active'));
        
        targetTab.setAttribute('aria-selected', "true"); targetTab.setAttribute('tabindex', "0"); 
        const panel = document.getElementById(targetId);
        if(panel) panel.classList.add('active');
    });
});

// 상단 KWCAG 탭 아코디언 로직 및 ESC 방어 코드
const kwcagTabs = document.querySelectorAll('.kwcag-tab');
kwcagTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        const clickedTab = e.currentTarget;
        const isExpanded = clickedTab.getAttribute('aria-expanded') === 'true';
        
        kwcagTabs.forEach(t => {
            t.setAttribute('aria-selected', 'false'); t.setAttribute('aria-expanded', 'false'); t.setAttribute('tabindex', '-1');
            const p = document.getElementById(t.getAttribute('aria-controls'));
            if (p) p.setAttribute('hidden', 'true');
        });
        
        if (!isExpanded) {
            clickedTab.setAttribute('aria-selected', 'true'); clickedTab.setAttribute('aria-expanded', 'true'); clickedTab.setAttribute('tabindex', '0');
            const p = document.getElementById(clickedTab.getAttribute('aria-controls'));
            if (p) p.removeAttribute('hidden');
            else console.warn('[Dev Guard] 패널이 존재하지 않습니다.');
        } else {
            clickedTab.setAttribute('tabindex', '0');
        }
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        kwcagTabs.forEach(t => {
            if (t.getAttribute('aria-expanded') === 'true') {
                t.setAttribute('aria-expanded', 'false'); t.setAttribute('aria-selected', 'false');
                const p = document.getElementById(t.getAttribute('aria-controls'));
                if (p) p.setAttribute('hidden', 'true');
                t.focus(); 
            }
        });
    }
});

// 3. 폼 제출 방어 로직
const loginForm = document.getElementById('login-form');
if(loginForm) { 
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        const emailInput = document.getElementById('user-email'), emailError = document.getElementById('email-error');
        if (!emailInput.value.includes('@')) {
            emailInput.setAttribute('aria-invalid', 'true'); if(emailError) emailError.removeAttribute('hidden'); emailInput.focus(); 
        } else {
            emailInput.setAttribute('aria-invalid', 'false'); if(emailError) emailError.setAttribute('hidden', 'true'); alert('접근성 100% 폼 제출 성공!');
        }
    });
}

// 4. 모달 및 팝업 이벤트 통제
let lastFocusNoti, lastFocusPopup;
const notiBtn = document.getElementById('noti-btn'), notiModal = document.getElementById('noti-modal'), closeBtn = document.getElementById('noti-close-btn');
if(notiBtn) notiBtn.addEventListener('click', () => { lastFocusNoti = document.activeElement; handleModalToggle('noti-modal', 'noti-btn', 'noti-close-btn', true); });
if(closeBtn) closeBtn.addEventListener('click', () => handleModalToggle('noti-modal', 'noti-btn', 'noti-close-btn', false, lastFocusNoti));
if(notiModal) notiModal.addEventListener('keydown', (e) => { if (e.key === 'Escape') handleModalToggle('noti-modal', 'noti-btn', 'noti-close-btn', false, lastFocusNoti); else trapFocus(notiModal, e); });

const detailPopup = document.getElementById('detail-popup'), popupCloseBtn = document.getElementById('popup-close-btn'), notiItems = document.querySelectorAll('.noti-item');
notiItems.forEach(item => {
    item.addEventListener('click', (e) => {
        lastFocusPopup = e.currentTarget;
        if (lastFocusPopup.classList.contains('unread')) {
            lastFocusPopup.classList.remove('unread'); lastFocusPopup.classList.add('read');
            const srText = lastFocusPopup.querySelector('.status-text'); if (srText) srText.textContent = '읽음';
            const redDot = lastFocusPopup.querySelector('.red-dot'); if (redDot) redDot.style.display = 'none';
        }
        handleModalToggle('detail-popup', null, 'popup-close-btn', true);
    });
});
if(popupCloseBtn) popupCloseBtn.addEventListener('click', () => handleModalToggle('detail-popup', null, 'popup-close-btn', false, lastFocusPopup));
if(detailPopup) detailPopup.addEventListener('keydown', (e) => { if (e.key === 'Escape') handleModalToggle('detail-popup', null, 'popup-close-btn', false, lastFocusPopup); else trapFocus(detailPopup, e); });

window.addEventListener('click', (e) => { 
    if (e.target === notiModal) handleModalToggle('noti-modal', 'noti-btn', 'noti-close-btn', false, lastFocusNoti); 
    if (e.target === detailPopup) handleModalToggle('detail-popup', null, 'popup-close-btn', false, lastFocusPopup); 
});

// === [수정됨] 5. 무한 루프 롤링 배너 로직 ===
const carouselTrack = document.getElementById('carousel-track'), originalItems = document.querySelectorAll('.carousel-item'), prevBtn = document.getElementById('carousel-prev'), nextBtn = document.getElementById('carousel-next'), pauseBtn = document.getElementById('carousel-pause');

if(carouselTrack && originalItems.length > 0) {
    let currentSlide = 1; // 1번 진짜 이미지부터 시작
    let slideInterval;
    let isPlaying = true;
    let isAnimating = false; // 광클릭 방어 변수
    const totalOriginalSlides = originalItems.length;

    // 1. 눈속임용 가짜 슬라이드 앞뒤로 복제
    const firstClone = originalItems[0].cloneNode(true);
    const lastClone = originalItems[totalOriginalSlides - 1].cloneNode(true);

    // 스크린 리더 중복 낭독 차단 및 포커스 제외
    firstClone.setAttribute('aria-hidden', 'true');
    firstClone.querySelectorAll('button, a, input, [tabindex]').forEach(el => el.setAttribute('tabindex', '-1'));
    lastClone.setAttribute('aria-hidden', 'true');
    lastClone.querySelectorAll('button, a, input, [tabindex]').forEach(el => el.setAttribute('tabindex', '-1'));

    // 복제된 노드를 DOM에 삽입
    carouselTrack.appendChild(firstClone);
    carouselTrack.insertBefore(lastClone, originalItems[0]);

    const allSlides = document.querySelectorAll('.carousel-item'); // 이제 총 7장
    carouselTrack.style.transform = `translateX(-100%)`; // 1번 위치로 세팅

    const playIcon = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    const pauseIcon = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;

    function updateSlideAria() {
        allSlides.forEach((slide, index) => {
            const focusable = slide.querySelectorAll('button, a, input, [tabindex]:not([tabindex="-1"])');
            if (index === currentSlide) {
                slide.setAttribute('aria-hidden', 'false');
                focusable.forEach(el => el.setAttribute('tabindex', '0'));
            } else {
                slide.setAttribute('aria-hidden', 'true');
                focusable.forEach(el => el.setAttribute('tabindex', '-1'));
            }
        });
    }

    function moveSlide(step) {
        if (isAnimating) return; // 넘어가고 있을 때는 클릭 무시
        isAnimating = true;
        currentSlide += step;
        carouselTrack.style.transition = 'transform 0.4s ease-in-out';
        carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
        updateSlideAria();
    }

    // 눈속임 점프 로직 (애니메이션이 끝난 직후 몰래 제자리로 이동)
    carouselTrack.addEventListener('transitionend', () => {
        isAnimating = false;
        if (currentSlide === 0) {
            carouselTrack.style.transition = 'none';
            currentSlide = totalOriginalSlides; // 5번으로 0초만에 점프
            carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
            updateSlideAria();
        } else if (currentSlide === totalOriginalSlides + 1) {
            carouselTrack.style.transition = 'none';
            currentSlide = 1; // 1번으로 0초만에 점프
            carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
            updateSlideAria();
        }
    });

    function togglePlay(forcePause) {
        if(forcePause || isPlaying) { 
            clearInterval(slideInterval); isPlaying = false; 
            pauseBtn.innerHTML = playIcon; pauseBtn.setAttribute('aria-label', '자동 재생 시작'); 
            carouselTrack.setAttribute('aria-live', 'polite'); 
        }
        else { 
            slideInterval = setInterval(() => moveSlide(1), 3000); isPlaying = true; 
            pauseBtn.innerHTML = pauseIcon; pauseBtn.setAttribute('aria-label', '자동 재생 정지'); 
            carouselTrack.setAttribute('aria-live', 'off'); 
        }
    }

    if(nextBtn) nextBtn.addEventListener('click', () => { togglePlay(true); moveSlide(1); });
    if(prevBtn) prevBtn.addEventListener('click', () => { togglePlay(true); moveSlide(-1); });
    if(pauseBtn) pauseBtn.addEventListener('click', () => togglePlay());

    updateSlideAria(); 
    togglePlay();
}

// 🚧 [수칙 4번 리마인드] 🚧
console.log('[Dev] 무한 롤링 루프 및 탭 글자색 강제 고정 완료. 배포 시 이 로그를 반드시 삭제하세요.');