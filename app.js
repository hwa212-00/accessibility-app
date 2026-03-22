const tabs = document.querySelectorAll('[role="tab"]');
const tabList = document.querySelector('[role="tablist"]');
let tabFocus = 0; // 현재 키보드가 위치한 탭의 인덱스 (0 = 홈)

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
        t.classList.remove('active');
    });

    // 2. 모든 패널 숨기기
    document.querySelectorAll('[role="tabpanel"]').forEach(p => {
        p.classList.remove('active');
    });

    // 3. 선택된 탭과 연결된 패널만 활성화
    targetTab.setAttribute('aria-selected', "true");
    targetTab.setAttribute('tabindex', 0); // 선택된 탭은 다시 포커스 가능하게
    targetTab.classList.add('active');
    
    document.getElementById(targetPanelId).classList.add('active');
}