// 탭을 바꾸는 함수
function changeTab(tabId) {
    // 1. 모든 탭 내용 숨기기
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => {
        content.classList.remove('active');
    });

    // 2. 누른 탭의 내용만 보이기
    const selectedContent = document.getElementById(tabId);
    selectedContent.classList.add('active');

    // 3. 네비게이션 버튼 색상 바꾸기 (선택 표시)
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });

    // 현재 클릭된 버튼을 찾아서 active 클래스 추가
    // (이벤트 객체를 쓰지 않고 단순하게 처리)
    event.currentTarget.classList.add('active');
}