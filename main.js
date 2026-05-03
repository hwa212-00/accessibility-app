const container = document.getElementById('shorts-container');
const articles = document.querySelectorAll('.short-item');
const srAnnouncer = document.getElementById('sr-announcer');

let currentIndex = 0;

function init() {
  setupIntersectionObserver();
  setupButtonListeners();
  setupKeyboardNavigation();
  setupTouchNavigation();
  setupHeaderListeners();
  
  if(articles.length > 0) {
    articles[0].focus();
    announceToScreenReader(`첫 번째 영상: ${articles[0].querySelector('.short-title').textContent}`);
  }
}

function announceToScreenReader(message) {
  srAnnouncer.textContent = message;
}

function setupHeaderListeners() {
  const headerBtns = document.querySelectorAll('.global-header .control-btn');
  headerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      announceToScreenReader(`${btn.getAttribute('aria-label')} 버튼이 클릭되었습니다.`);
    });
  });
}

function setupIntersectionObserver() {
  const options = { root: container, rootMargin: '0px', threshold: 0.6 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const articleIndex = Array.from(articles).indexOf(entry.target);
      if (entry.isIntersecting) {
        currentIndex = articleIndex;
        entry.target.focus();
        
        // 더미 상태이므로 비디오 재생 로직은 제외하고 버튼 상태만 업데이트
        updatePlayPauseButton(entry.target, true);
        const title = entry.target.querySelector('.short-title').textContent;
        announceToScreenReader(`영상 전환됨: ${title}`);
      } else {
        updatePlayPauseButton(entry.target, false);
      }
    });
  }, options);
  articles.forEach(article => observer.observe(article));
}

function setupButtonListeners() {
  articles.forEach(article => {
    const playPauseBtn = article.querySelector('.play-pause-btn');
    const likeBtn = article.querySelector('.like-btn');
    const commentBtn = article.querySelector('.comment-btn');
    const moreBtn = article.querySelector('.more-btn');
    const followBtn = article.querySelector('.follow-btn');

    playPauseBtn.addEventListener('click', () => {
      const isPlaying = playPauseBtn.getAttribute('aria-pressed') === 'true';
      updatePlayPauseButton(article, !isPlaying);
      announceToScreenReader(!isPlaying ? "재생됨" : "일시정지됨");
    });

    likeBtn.addEventListener('click', () => {
      const isPressed = likeBtn.getAttribute('aria-pressed') === 'true';
      likeBtn.setAttribute('aria-pressed', !isPressed);
      announceToScreenReader(!isPressed ? "좋아요 추가됨" : "좋아요 취소됨");
    });

    followBtn.addEventListener('click', () => {
      const isPressed = followBtn.getAttribute('aria-pressed') === 'true';
      followBtn.setAttribute('aria-pressed', !isPressed);
      followBtn.textContent = !isPressed ? "구독중" : "구독";
      announceToScreenReader(!isPressed ? "구독 시작함" : "구독 취소함");
    });

    commentBtn.addEventListener('click', () => announceToScreenReader("댓글 창 열림"));
    moreBtn.addEventListener('click', () => announceToScreenReader("더보기 메뉴 열림"));
  });
}

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

function setupKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    if (document.activeElement.tagName === 'BUTTON' && e.key === ' ') return;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault(); scrollToIndex(currentIndex + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault(); scrollToIndex(currentIndex - 1);
    } else if (e.key === ' ' || e.key === 'k') {
      e.preventDefault(); articles[currentIndex].querySelector('.play-pause-btn').click();
    }
  });
}

let touchStartY = 0;
let touchEndY = 0;
const SWIPE_THRESHOLD = 50;

function setupTouchNavigation() {
  container.addEventListener('touchstart', (e) => {
    if (e.target.closest('button')) return;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    if (e.target.closest('button')) return;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  }, { passive: true });
}

function handleSwipe() {
  const swipeDistance = touchStartY - touchEndY;
  if (swipeDistance > SWIPE_THRESHOLD) {
    if (currentIndex < articles.length - 1) scrollToIndex(currentIndex + 1);
    else announceToScreenReader("마지막 영상입니다.");
  } else if (swipeDistance < -SWIPE_THRESHOLD) {
    if (currentIndex > 0) scrollToIndex(currentIndex - 1);
    else announceToScreenReader("첫 번째 영상입니다.");
  }
}

function scrollToIndex(index) {
  if (index >= 0 && index < articles.length) {
    articles[index].scrollIntoView({ behavior: 'smooth' });
  }
}

init();
