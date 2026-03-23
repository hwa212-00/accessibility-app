const tabs = document.querySelectorAll('[role="tab"]');
const tabList = document.querySelector('[role="tablist"]');
let tabFocus = 0; 

tabList.addEventListener('keydown', (e) => {
    if (e.keyCode === 39 || e.keyCode === 37) {
        tabs[tabFocus].setAttribute('tabindex', -1);
        
        if (e.keyCode === 39) {
            tabFocus++;
            if (tabFocus >= tabs.length) tabFocus = 0; 
        } 
        else if (e.keyCode === 37) {
            tabFocus--;
            if (tabFocus < 0) tabFocus = tabs.length - 1;
        }

        tabs[tabFocus].setAttribute('tabindex', 0);
        tabs[tabFocus].focus();
    }
});

tabs.forEach((tab, index) => {
    tab.addEventListener('click', (e) => {
        tabFocus = index; 
        changeTab(e);
    });
});

function changeTab(e) {
    const targetTab = e.currentTarget;
    const targetPanelId = targetTab.getAttribute('aria-controls');
    
    // 탭 이름 가져오기 (예: '카테고리', '쇼츠' 등)
    const tabName = targetTab.querySelector('.tab-label').textContent;
    const headerTitleArea = document.getElementById('header-title');

    // [핵심 로직] 홈 탭이면 로고를, 아니면 탭 이름을 헤더에 표시!
    if (targetPanelId === 'home') {
        headerTitleArea.innerHTML = `<a href="#home" class="logo" onclick="document.getElementById('tab-home').click(); return false;">HWA</a>`;
    } else {
        headerTitleArea.innerHTML = tabName;
    }

    // 기존 탭 전환 로직
    tabs.forEach(t => {
        t.setAttribute('aria-selected', "false");
        t.setAttribute('tabindex', -1); 
    });

    document.querySelectorAll('[role="tabpanel"]').forEach(p => {
        p.classList.remove('active');
    });

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