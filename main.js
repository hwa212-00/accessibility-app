// DOM Elements
const container = document.getElementById('shorts-container');
const articles = document.querySelectorAll('.short-item');
const srAnnouncer = document.getElementById('sr-announcer');

// State
let currentIndex = 0;
let isGlobalMuted = true; // 전역 음소거 상태

// 초기화
function init() {
  setupIntersectionObserver();
  setupButtonListeners();
  setupKeyboardNavigation();
  
  // 첫 번째 아이템에 초점 부여 (접근성)
  if(articles.length > 0) {
    articles[0].focus();
    announceToScreenReader(`첫 번째 영상: ${articles[0].querySelector('.short-title').textContent}`);
  }
}

// 스크린 리더 라이브 리전 업데이트 함수
function announceToScreenReader(message) {
  srAnnouncer.textContent = message;
}

// Intersection Observer (어떤 영상이 화면에 보이는지 감지)
function setupIntersectionObserver() {
  const options = {
    root: container,
    rootMargin: '0px',
    threshold: 0.6 // 60% 이상 보이면 활성화
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target.querySelector('video');
      const articleIndex = Array.from(articles).indexOf(entry.target);
      
      if (entry.isIntersecting) {
        // 영상 활성화
        currentIndex = articleIndex;
        entry.target.focus(); // 초점 이동
        
        video.muted = isGlobalMuted; // 전역 음소거 상태 적용
        
        // 브라우저 정책상 터치 전 자동재생이 막힐 수 있으므로 예외처리
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            updatePlayPauseButton(entry.target, true);
          }).catch(error => {
            console.log("자동재생이 차단되었습니다:", error);
            updatePlayPauseButton(entry.target, false);
          });
        }
        
        // 스크린 리더에 현재 영상 제목 알림
        const title = entry.target.querySelector('.short-title').textContent;
        announceToScreenReader(`영상 전환됨: ${title}`);
        
      } else {
        // 화면에서 벗어난 영상 일시정지 및 초점 초기화
        video.pause();
        video.currentTime = 0;
        updatePlayPauseButton(entry.target, false);
      }
    });
  }, options);

  articles.forEach(article => {
    observer.observe(article);
  });
}

// 각 버튼 이벤트 리스너 세팅
function setupButtonListeners() {
  articles.forEach(article => {
    const video = article.querySelector('video');
    const playPauseBtn = article.querySelector('.play-pause-btn');
    const muteBtn = article.querySelector('.mute-btn');
    const likeBtn = article.querySelector('.like-btn');

    // 재생/일시정지 토글
    playPauseBtn.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        updatePlayPauseButton(article, true);
        announceToScreenReader("재생됨");
      } else {
        video.pause();
        updatePlayPauseButton(article, false);
        announceToScreenReader("일시정지됨");
      }
    });

    // 음소거 토글
    muteBtn.addEventListener('click', () => {
      isGlobalMuted = !isGlobalMuted;
      video.muted = isGlobalMuted;
      updateMuteButton(article, isGlobalMuted);
      
      // 다른 모든 영상의 아이콘도 동기화
      articles.forEach(a => updateMuteButton(a, isGlobalMuted));
      
      announceToScreenReader(isGlobalMuted ? "음소거됨" : "음소거 해제됨");
    });

    // 좋아요 토글
    likeBtn.addEventListener('click', () => {
      const isPressed = likeBtn.getAttribute('aria-pressed') === 'true';
      likeBtn.setAttribute('aria-pressed', !isPressed);
      announceToScreenReader(!isPressed ? "좋아요 추가됨" : "좋아요 취소됨");
    });
    
    // 비디오 클릭/터치 시 재생/일시정지 (오버레이 외의 영역)
    article.addEventListener('click', (e) => {
      if(e.target === article) {
         playPauseBtn.click();
      }
    });
  });
}

// UI 상태 업데이트 헬퍼 (재생)
function updatePlayPauseButton(article, isPlaying) {
  const btn = article.querySelector('.play-pause-btn');
  const iconPlay = btn.querySelector('.icon-play');
  const iconPause = btn.querySelector('.icon-pause');
  
  btn.setAttribute('aria-pressed', isPlaying);
  btn.setAttribute('aria-label', isPlaying ? '일시정지' : '재생');
  
  if(isPlaying) {
    iconPlay.classList.add('hidden');
    iconPause.classList.remove('hidden');
  } else {
    iconPlay.classList.remove('hidden');
    iconPause.classList.add('hidden');
  }
}

// UI 상태 업데이트 헬퍼 (음소거)
function updateMuteButton(article, isMuted) {
  const btn = article.querySelector('.mute-btn');
  const iconMute = btn.querySelector('.icon-mute');
  const iconUnmute = btn.querySelector('.icon-unmute');
  
  btn.setAttribute('aria-pressed', isMuted);
  btn.setAttribute('aria-label', isMuted ? '음소거 해제' : '음소거');
  
  if(isMuted) {
    iconMute.classList.remove('hidden');
    iconUnmute.classList.add('hidden');
  } else {
    iconMute.classList.add('hidden');
    iconUnmute.classList.remove('hidden');
  }
}

// 키보드 내비게이션 (방향키, 스페이스바 등)
function setupKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    // 활성 요소가 버튼 내부일 때는 스페이스바 이벤트를 버튼 클릭으로 맡김
    if (document.activeElement.tagName === 'BUTTON' && e.key === ' ') {
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      scrollToIndex(currentIndex + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      scrollToIndex(currentIndex - 1);
    } else if (e.key === ' ' || e.key === 'k') { // 스페이스바 또는 K (유튜브 단축키)
      e.preventDefault();
      const currentArticle = articles[currentIndex];
      const playPauseBtn = currentArticle.querySelector('.play-pause-btn');
      playPauseBtn.click();
    } else if (e.key === 'm') { // M (유튜브 단축키)
      e.preventDefault();
      const currentArticle = articles[currentIndex];
      const muteBtn = currentArticle.querySelector('.mute-btn');
      muteBtn.click();
    }
  });
}

function scrollToIndex(index) {
  if (index >= 0 && index < articles.length) {
    articles[index].scrollIntoView({ behavior: 'smooth' });
  }
}

// 시작
init();
