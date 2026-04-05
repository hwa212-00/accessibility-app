// 브라우저 기본 스크롤 복원 막기 및 페이지 진입 시 최상단 강제 고정
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);
});

// 1. 공통 유틸리티 함수 설정
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
            tabs[focusIdx].focus({ preventScroll: true }); 
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

        // 탭 전환 시 시각적 스크롤 무조건 최상단으로 초기화
        window.scrollTo(0, 0); 
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
            // 알림 리스트 내부 읽음 처리
            lastFocusPopup.classList.remove('unread'); lastFocusPopup.classList.add('read');
            const srText = lastFocusPopup.querySelector('.status-text'); if (srText) srText.textContent = '읽음';
            const redDot = lastFocusPopup.querySelector('.red-dot'); if (redDot) redDot.style.display = 'none';

            // 헤더 메인 버튼의 새 알림 뱃지 제거 및 스크린 리더 텍스트 변경
            const mainNotiBtn = document.getElementById('noti-btn');
            const mainNotiDot = document.getElementById('header-noti-dot');
            if (mainNotiDot) mainNotiDot.style.display = 'none';
            if (mainNotiBtn) mainNotiBtn.setAttribute('aria-label', '알림');
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

// 5. 무한 루프 롤링 배너 로직
const carouselTrack = document.getElementById('carousel-track'), originalItems = document.querySelectorAll('.carousel-item'), prevBtn = document.getElementById('carousel-prev'), nextBtn = document.getElementById('carousel-next'), pauseBtn = document.getElementById('carousel-pause');

if(carouselTrack && originalItems.length > 0) {
    let currentSlide = 1; 
    let slideInterval;
    let isPlaying = true;
    let isAnimating = false; 
    const totalOriginalSlides = originalItems.length;

    const firstClone = originalItems[0].cloneNode(true);
    const lastClone = originalItems[totalOriginalSlides - 1].cloneNode(true);

    firstClone.setAttribute('aria-hidden', 'true');
    firstClone.querySelectorAll('button, a, input, [tabindex]').forEach(el => el.setAttribute('tabindex', '-1'));
    lastClone.setAttribute('aria-hidden', 'true');
    lastClone.querySelectorAll('button, a, input, [tabindex]').forEach(el => el.setAttribute('tabindex', '-1'));

    carouselTrack.appendChild(firstClone);
    carouselTrack.insertBefore(lastClone, originalItems[0]);

    const allSlides = document.querySelectorAll('.carousel-item'); 
    carouselTrack.style.transform = `translateX(-100%)`; 

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
        if (isAnimating) return; 
        isAnimating = true;
        currentSlide += step;
        carouselTrack.style.transition = 'transform 0.4s ease-in-out';
        carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
        updateSlideAria();
    }

    carouselTrack.addEventListener('transitionend', () => {
        isAnimating = false;
        if (currentSlide === 0) {
            carouselTrack.style.transition = 'none';
            currentSlide = totalOriginalSlides; 
            carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
            updateSlideAria();
        } else if (currentSlide === totalOriginalSlides + 1) {
            carouselTrack.style.transition = 'none';
            currentSlide = 1; 
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

// 6. 오늘의 팁 365 자동 렌더링 로직 (data.js 연동)
const tipElement = document.getElementById('daily-tip-text');
if (tipElement && typeof dailyTips !== 'undefined') {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0); 
    const diff = today - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay); 
    
    const tipIndex = (dayOfYear - 1) % dailyTips.length;
    tipElement.textContent = `"${dailyTips[tipIndex]}"`;
}

// === [신규 추가] 7. 카테고리 탭: 커스텀 드롭다운 및 아코디언 필터링 로직 ===
const categoryBtn = document.getElementById('category-filter-btn');
const categoryListbox = document.getElementById('category-listbox');
const categoryOptions = categoryListbox ? categoryListbox.querySelectorAll('[role="option"]') : [];
const selectedText = document.getElementById('selected-category-text');
const accordionItems = document.querySelectorAll('.accordion-item');

if (categoryBtn && categoryListbox) {
    // 드롭다운 열기/닫기
    const toggleDropdown = (open) => {
        if (open) {
            categoryListbox.removeAttribute('hidden');
            categoryBtn.setAttribute('aria-expanded', 'true');
            // 열리면 현재 선택된 옵션으로 자동 포커스
            const selectedOpt = Array.from(categoryOptions).find(opt => opt.getAttribute('aria-selected') === 'true') || categoryOptions[0];
            selectedOpt.focus();
        } else {
            categoryListbox.setAttribute('hidden', 'true');
            categoryBtn.setAttribute('aria-expanded', 'false');
            categoryBtn.focus();
        }
    };

    categoryBtn.addEventListener('click', () => {
        const isExpanded = categoryBtn.getAttribute('aria-expanded') === 'true';
        toggleDropdown(!isExpanded);
    });

    // 드롭다운 내부 키보드 방향키 조작
    categoryListbox.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            toggleDropdown(false);
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const focusableOptions = Array.from(categoryOptions);
            const currentIndex = focusableOptions.indexOf(document.activeElement);
            let nextIndex = currentIndex;

            if (e.key === 'ArrowDown') nextIndex = (currentIndex + 1) % focusableOptions.length;
            if (e.key === 'ArrowUp') nextIndex = (currentIndex - 1 + focusableOptions.length) % focusableOptions.length;
            
            focusableOptions[nextIndex].focus();
        }
    });

    // 항목 클릭 시 필터링 실행
    categoryOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            const value = e.currentTarget.getAttribute('data-value');
            const text = e.currentTarget.textContent;
            
            // 옵션의 ARIA 선택 상태 변경
            categoryOptions.forEach(opt => opt.setAttribute('aria-selected', 'false'));
            e.currentTarget.setAttribute('aria-selected', 'true');
            selectedText.textContent = text;
            
            // 해당 카테고리에 맞는 아코디언만 보여주기
            accordionItems.forEach(item => {
                if (value === 'all' || item.getAttribute('data-category') === value) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });

            toggleDropdown(false);
        });
    });

    // 드롭다운 밖의 빈 화면을 누르면 자동으로 닫히는 방어 로직 (Click Outside)
    document.addEventListener('click', (e) => {
        if (!categoryBtn.contains(e.target) && !categoryListbox.contains(e.target)) {
            if (categoryBtn.getAttribute('aria-expanded') === 'true') toggleDropdown(false);
        }
    });
}

// 아코디언 패널 열기/닫기 로직
const accordionHeaders = document.querySelectorAll('.accordion-header');
accordionHeaders.forEach(header => {
    header.addEventListener('click', (e) => {
        const isExpanded = header.getAttribute('aria-expanded') === 'true';
        const panelId = header.getAttribute('aria-controls');
        const panel = document.getElementById(panelId);
        
        if (isExpanded) {
            header.setAttribute('aria-expanded', 'false');
            if (panel) panel.setAttribute('hidden', 'true');
        } else {
            header.setAttribute('aria-expanded', 'true');
            if (panel) panel.removeAttribute('hidden');
        }
    });
});