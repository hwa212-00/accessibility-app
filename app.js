// --- 기존 탭 이동 및 키보드 접근성 로직 ---
const tabs = document.querySelectorAll('[role="tab"]');
const tabList = document.querySelector('[role="tablist"]');
let tabFocus = 0; // 현재 키보드가 위치한 탭의 인덱스 (0=홈)

// 1. 방향키로 탭 안에서만 이동하기 (Roving tabindex)
tabList.addEventListener('keydown', (e) => {
    // 왼쪽(37) 또는 오른쪽(39) 화살표를 눌렀을 때만 동작
    if (e.keyCode === 39 || e.keyCode === 37) {
        // 기존 탭은 키보드 초점을 잃게 함
        tabs[tabFocus].setAttribute('tabindex', -1);
        
        // 오른쪽 화살표: 다음 탭으로 (끝이면 처음으로)
        if (e.keyCode === 39) {
            tabFocus++;
            if (tabFocus >= tabs.length) tabFocus = 0; 
        } 
        // 왼쪽 화살표: 이전 탭으로 (처음이면 끝으로)
        else if (e.keyCode === 37) {
            tabFocus--;
            if (tabFocus < 0) tabFocus = tabs.length - 1;
        }

        // 새 탭에 초점 주기
        tabs[tabFocus].setAttribute('tabindex', 0);
        tabs[tabFocus].focus();
    }
});

// 2. 탭을 클릭하거나 키보드(엔터/스페이스)로 선택했을 때 화면 바꾸기
tabs.forEach((tab, index) => {
    tab.addEventListener('click', (e) => {
        tabFocus = index; // 클릭 시 포커스 위치 동기화
        changeTab(e);
    });
});

function changeTab(e) {
    const targetTab = e.currentTarget;
    const targetPanelId = targetTab.getAttribute('aria-controls');

    // 1. 모든 탭 선택 해제 및 초기화
    tabs.forEach(t => {
        t.setAttribute('aria-selected', "false");
        t.setAttribute('tabindex', -1); 
        t.classList.remove('active'); // CSS 색상용 클래스 제거
    });

    // 2. 모든 패널 숨기기
    document.querySelectorAll('[role="tabpanel"]').forEach(p => {
        p.classList.remove('active');
    });

    // 3. 선택된 탭과 연결된 패널만 활성화
    targetTab.setAttribute('aria-selected', "true");
    targetTab.setAttribute('tabindex', 0); // 선택된 탭은 다시 포커스 가능하게
    targetTab.classList.add('active'); // CSS 색상용 클래스 추가
    
    document.getElementById(targetPanelId).classList.add('active');
}

// --- 로그인 폼 검증 로직 (기존 유지) ---
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('user-email');
const emailError = document.getElementById('email-error');

if(loginForm) { // 로그인 폼이 있을 때만 실행
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // 페이지 새로고침 방지
        
        // 단순 이메일 형식 검사 (접근성 에러 낭독 테스트용)
        if (!emailInput.value.includes('@')) {
            // 스크린 리더에게 에러 상태임을 알림
            emailInput.setAttribute('aria-invalid', 'true');
            // 에러 메시지 보이게 하기
            emailError.removeAttribute('hidden');
            // 사용자가 바로 수정할 수 있도록 포커스 이동 (매우 중요!)
            emailInput.focus(); 
        } else {
            // 성공 시 에러 상태 초기화
            emailInput.setAttribute('aria-invalid', 'false');
            emailError.setAttribute('hidden', 'true');
            alert('접근성 100% 폼 제출 성공!');
        }
    });
}