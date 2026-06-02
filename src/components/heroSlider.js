export function initHeroSlider() {
  const video = document.querySelector('.hero-reel-player');
  if (!video) return;

  const playlist = [
    '/Videos/video1.mp4',
    '/Videos/video2.mp4',
    '/Videos/video3.mp4',
    '/Videos/antesydespues.mp4'
  ];

  let currentIndex = 0;

  const playIndex = (index) => {
    currentIndex = index % playlist.length;
    video.src = playlist[currentIndex];
    video.load();
    video.play().catch(err => console.log('Autoplay failed: ', err));
  };

  video.addEventListener('ended', () => {
    playIndex(currentIndex + 1);
  });

  playIndex(0);
}
