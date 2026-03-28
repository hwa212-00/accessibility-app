// === [필수] JS 에러 연쇄 붕괴 방어막 추가 ===
const tabs = document.querySelectorAll('[role="tab"]');
const tabList = document.querySelector('[role="tablist"]');
let tabFocus = 0; 

if(tabList) {
    tabList.addEventListener('keydown', (e) => {
        if (e.keyCode === 39 || e.keyCode === 37) {
            tabs[tabFocus].setAttribute('tabindex', -1);
            if (e.keyCode === 39) { tabFocus++; if (tabFocus >= tabs.length) tabFocus = 0; } 
            else if (e.keyCode === 37) { tabFocus--; if (tabFocus < 0) tabFocus = tabs.length - 1; }
            tabs[tabFocus].setAttribute('tabindex', 0); tabs[tabFocus].focus();
        }
    });
}

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
    
    const panel = document.getElementById(targetPanelId);
    if(panel) panel.classList.add('active');
}

const loginForm = document.getElementById('login-form');
if(loginForm) { 
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        const emailInput = document.getElementById('user-email');
        const emailError = document.getElementById('email-error');
        if (!emailInput.value.includes('@')) {
            emailInput.setAttribute('aria-invalid', 'true'); if(emailError) emailError.removeAttribute('hidden'); emailInput.focus(); 
        } else {
            emailInput.setAttribute('aria-invalid', 'false'); if(emailError) emailError.setAttribute('hidden', 'true'); alert('접근성 100% 폼 제출 성공!');
        }
    });
}

function trapFocus(element, event) {
    const isTabPressed = event.key === 'Tab' || event.keyCode === 9;
    if (!isTabPressed) return;
    const focusableElements = element.querySelectorAll('button, a, input, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length === 0) return;
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    if (event.shiftKey) { if (document.activeElement === firstElement) { lastElement.focus(); event.preventDefault(); } } 
    else { if (document.activeElement === lastElement) { firstElement.focus(); event.preventDefault(); } }
}

const notiBtn = document.getElementById('noti-btn');
const notiModal = document.getElementById('noti-modal');
const closeBtn = document.getElementById('noti-close-btn');
let lastFocusedBeforeNoti; 
function openNoti() {
    lastFocusedBeforeNoti = document.activeElement; 
    if(notiModal) { notiModal.classList.add('active'); notiModal.setAttribute('aria-hidden', 'false'); }
    if(notiBtn) notiBtn.setAttribute('aria-expanded', 'true'); 
    if(closeBtn) closeBtn.focus(); 
}
function closeNoti() {
    if(notiModal) { notiModal.classList.remove('active'); notiModal.setAttribute('aria-hidden', 'true'); }
    if(notiBtn) notiBtn.setAttribute('aria-expanded', 'false');
    if(lastFocusedBeforeNoti) lastFocusedBeforeNoti.focus();
}
if(notiBtn) notiBtn.addEventListener('click', openNoti);
if(closeBtn) closeBtn.addEventListener('click', closeNoti);
if(notiModal) notiModal.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeNoti(); return; } trapFocus(notiModal, e); });

const detailPopup = document.getElementById('detail-popup');
const popupCloseBtn = document.getElementById('popup-close-btn');
const notiItems = document.querySelectorAll('.noti-item');
let lastFocusedNotiItem; 
function openPopup() { 
    if(detailPopup) { detailPopup.classList.add('active'); detailPopup.setAttribute('aria-hidden', 'false'); }
    if(popupCloseBtn) popupCloseBtn.focus(); 
}
function closePopup() { 
    if(detailPopup) { detailPopup.classList.remove('active'); detailPopup.setAttribute('aria-hidden', 'true'); }
    if(lastFocusedNotiItem) lastFocusedNotiItem.focus(); 
}

notiItems.forEach(item => {
    item.addEventListener('click', (e) => {
        lastFocusedNotiItem = e.currentTarget;
        if (lastFocusedNotiItem.classList.contains('unread')) {
            lastFocusedNotiItem.classList.remove('unread');
            lastFocusedNotiItem.classList.add('read');
            const srText = lastFocusedNotiItem.querySelector('.status-text');
            if (srText) srText.textContent = '읽음';
            const redDot = lastFocusedNotiItem.querySelector('.red-dot');
            if (redDot) redDot.style.display = 'none';
        }
        openPopup();
    });
});
if(popupCloseBtn) popupCloseBtn.addEventListener('click', closePopup);
if(detailPopup) detailPopup.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closePopup(); return; } trapFocus(detailPopup, e); });
window.addEventListener('click', (e) => { if (e.target === notiModal) closeNoti(); if (e.target === detailPopup) closePopup(); });

// 롤링 배너 로직 (Null Error 완전 차단)
const carouselTrack = document.getElementById('carousel-track');
const carouselItems = document.querySelectorAll('.carousel-item');
const prevBtn = document.getElementById('carousel-prev');
const nextBtn = document.getElementById('carousel-next');
const pauseBtn = document.getElementById('carousel-pause');

if(carouselTrack && carouselItems.length > 0) {
    let currentSlide = 0;
    let slideInterval;
    let isPlaying = true;
    const totalSlides = carouselItems.length;
    const playIconSVG = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    const pauseIconSVG = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;

    function updateSlidePosition() {
        carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
        carouselItems.forEach((slide, index) => {
            const focusableInSlide = slide.querySelectorAll('button, a, input, [tabindex]:not([tabindex="-1"])');
            if (index === currentSlide) {
                slide.setAttribute('aria-hidden', 'false');
                focusableInSlide.forEach(el => el.setAttribute('tabindex', '0')); 
            } else {
                slide.setAttribute('aria-hidden', 'true');
                focusableInSlide.forEach(el => el.setAttribute('tabindex', '-1')); 
            }
        });
    }

    function nextSlide() { currentSlide = (currentSlide + 1) % totalSlides; updateSlidePosition(); }
    function prevSlide() { currentSlide = (currentSlide - 1 + totalSlides) % totalSlides; updateSlidePosition(); }
    
    function pauseCarousel() { 
        clearInterval(slideInterval); 
        isPlaying = false; 
        if(pauseBtn) {
            pauseBtn.innerHTML = playIconSVG; 
            pauseBtn.setAttribute('aria-label', '자동 재생 시작'); 
        }
        carouselTrack.setAttribute('aria-live', 'polite'); 
    }
    
    function playCarousel() { 
        slideInterval = setInterval(nextSlide, 3000); 
        isPlaying = true; 
        if(pauseBtn) {
            pauseBtn.innerHTML = pauseIconSVG; 
            pauseBtn.setAttribute('aria-label', '자동 재생 정지'); 
        }
        carouselTrack.setAttribute('aria-live', 'off'); 
    }

    if(nextBtn) nextBtn.addEventListener('click', () => { pauseCarousel(); nextSlide(); });
    if(prevBtn) prevBtn.addEventListener('click', () => { pauseCarousel(); prevSlide(); });
    if(pauseBtn) pauseBtn.addEventListener('click', () => { if (isPlaying) pauseCarousel(); else playCarousel(); });

    updateSlidePosition(); 
    playCarousel();
}

// 🚧 수칙 4번: 배포 전 리마인드
console.log('[Dev] 자바스크립트 Null 병합 처리 및 CSS 방어막 세팅 완료. console.log를 지워주세요.');