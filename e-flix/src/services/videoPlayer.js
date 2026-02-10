class VideoPlayer {
  constructor() {
    this.player = null;
    this.video = null;
    this.controls = null;
    this.settings = storage.getSettings();
    this.qualities = ['360p', '480p', '720p', '1080p', '4K'];
    this.currentQuality = this.settings.quality;
    this.isFullscreen = false;
    this.isPlaying = false;
    this.bufferTimer = null;
    this.init();
  }

  async init() {
    this.createPlayer();
    this.setupEventListeners();
    this.setupKeyboardShortcuts();
  }

  createPlayer() {
    // Remove existing player
    const existingPlayer = document.getElementById('video-player');
    if (existingPlayer) existingPlayer.remove();

    // Create player container
    this.player = document.createElement('div');
    this.player.id = 'video-player';
    this.player.className = 'video-player';
    this.player.setAttribute('role', 'dialog');
    this.player.setAttribute('aria-modal', 'true');
    this.player.setAttribute('aria-label', 'Reprodutor de vídeo');

    this.player.innerHTML = `
      <div class="player__container">
        <div class="player__video-wrapper">
          <video 
            id="video-element"
            class="player__video"
            playsinline
            preload="metadata"
            aria-label="Conteúdo em reprodução"
          >
            Seu navegador não suporta o elemento de vídeo.
          </video>
          
          <div class="player__overlay">
            <button class="player__close" aria-label="Fechar reprodutor">
              <i class="fas fa-times"></i>
            </button>
            
            <div class="player__center-controls">
              <button class="player__play-pause" aria-label="Reproduzir/Pausar">
                <i class="fas fa-play"></i>
              </button>
            </div>
            
            <div class="player__bottom-controls">
              <div class="player__progress">
                <input 
                  type="range" 
                  class="player__progress-bar"
                  min="0" 
                  max="100" 
                  value="0"
                  aria-label="Barra de progresso"
                >
                <div class="player__progress-time">
                  <span class="player__current-time">0:00</span>
                  <span class="player__duration">0:00</span>
                </div>
              </div>
              
              <div class="player__secondary-controls">
                <div class="player__left-controls">
                  <button class="player__rewind" aria-label="Retroceder 10 segundos">
                    <i class="fas fa-backward"></i>
                  </button>
                  <button class="player__play-pause-small" aria-label="Reproduzir/Pausar">
                    <i class="fas fa-play"></i>
                  </button>
                  <button class="player__forward" aria-label="Avançar 10 segundos">
                    <i class="fas fa-forward"></i>
                  </button>
                  
                  <div class="player__volume">
                    <button class="player__volume-btn" aria-label="Mutar/Desmutar">
                      <i class="fas fa-volume-up"></i>
                    </button>
                    <input 
                      type="range" 
                      class="player__volume-bar"
                      min="0" 
                      max="100" 
                      value="${this.settings.volume * 100}"
                      aria-label="Controle de volume"
                    >
                  </div>
                  
                  <span class="player__time-display">
                    <span class="player__current-time">0:00</span> / 
                    <span class="player__duration">0:00</span>
                  </span>
                </div>
                
                <div class="player__right-controls">
                  <div class="player__settings">
                    <button class="player__settings-btn" aria-label="Configurações">
                      <i class="fas fa-cog"></i>
                    </button>
                    <div class="player__settings-menu" aria-hidden="true">
                      <div class="settings__section">
                        <h4>Qualidade</h4>
                        ${this.qualities.map(quality => `
                          <button 
                            class="settings__option ${quality === this.currentQuality ? 'active' : ''}"
                            data-quality="${quality}"
                          >
                            ${quality}
                          </button>
                        `).join('')}
                      </div>
                      <div class="settings__section">
                        <h4>Velocidade</h4>
                        ${[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => `
                          <button 
                            class="settings__option"
                            data-speed="${speed}"
                          >
                            ${speed}x
                          </button>
                        `).join('')}
                      </div>
                      <div class="settings__section">
                        <h4>Legendas</h4>
                        <button class="settings__option">Português</button>
                        <button class="settings__option">English</button>
                        <button class="settings__option">Off</button>
                      </div>
                    </div>
                  </div>
                  
                  <button class="player__fullscreen" aria-label="Tela cheia">
                    <i class="fas fa-expand"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="player__info">
          <h2 class="player__title"></h2>
          <p class="player__description"></p>
          <div class="player__metadata"></div>
        </div>
      </div>
    `;

    document.body.appendChild(this.player);
    this.video = this.player.querySelector('#video-element');
    this.controls = this.player.querySelector('.player__overlay');
    
    this.hide();
  }

  async play(content) {
    this.show();
    
    try {
      this.video.src = content.url;
      this.video.setAttribute('aria-label', `Reproduzindo: ${content.title}`);
      
      this.player.querySelector('.player__title').textContent = content.title;
      this.player.querySelector('.player__description').textContent = content.description || '';
      
      await this.video.play();
      this.isPlaying = true;
      this.updatePlayButton();
      
      // Track recent content
      storage.addRecent({
        id: content.id || Date.now(),
        title: content.title,
        type: 'video',
        thumbnail: content.thumbnail
      });
      
      // Set initial volume
      this.video.volume = this.settings.volume;
      
    } catch (error) {
      console.error('Playback error:', error);
      this.showError('Não foi possível reproduzir o vídeo. Verifique sua conexão.');
    }
  }

  setupEventListeners() {
    // Play/Pause
    const playButtons = this.player.querySelectorAll('.player__play-pause, .player__play-pause-small');
    playButtons.forEach(btn => {
      btn.addEventListener('click', () => this.togglePlay());
    });

    // Progress bar
    const progressBar = this.player.querySelector('.player__progress-bar');
    progressBar.addEventListener('input', (e) => {
      const time = (e.target.value / 100) * this.video.duration;
      this.video.currentTime = time;
    });

    // Volume
    const volumeBar = this.player.querySelector('.player__volume-bar');
    volumeBar.addEventListener('input', (e) => {
      const volume = e.target.value / 100;
      this.video.volume = volume;
      this.settings.volume = volume;
      storage.saveSettings(this.settings);
      this.updateVolumeIcon();
    });

    const volumeBtn = this.player.querySelector('.player__volume-btn');
    volumeBtn.addEventListener('click', () => this.toggleMute());

    // Fullscreen
    const fullscreenBtn = this.player.querySelector('.player__fullscreen');
    fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

    // Close
    const closeBtn = this.player.querySelector('.player__close');
    closeBtn.addEventListener('click', () => this.hide());

    // Video events
    this.video.addEventListener('timeupdate', () => this.updateProgress());
    this.video.addEventListener('loadedmetadata', () => this.updateDuration());
    this.video.addEventListener('play', () => {
      this.isPlaying = true;
      this.updatePlayButton();
    });
    this.video.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updatePlayButton();
    });
    this.video.addEventListener('waiting', () => this.showBuffer());
    this.video.addEventListener('playing', () => this.hideBuffer());
    this.video.addEventListener('ended', () => this.onVideoEnd());

    // Settings
    const settingsBtn = this.player.querySelector('.player__settings-btn');
    const settingsMenu = this.player.querySelector('.player__settings-menu');
    
    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsMenu.setAttribute('aria-hidden', 
        settingsMenu.getAttribute('aria-hidden') === 'true' ? 'false' : 'true'
      );
    });

    // Quality settings
    settingsMenu.addEventListener('click', (e) => {
      if (e.target.dataset.quality) {
        this.changeQuality(e.target.dataset.quality);
      }
      if (e.target.dataset.speed) {
        this.changePlaybackRate(parseFloat(e.target.dataset.speed));
      }
    });

    // Hide controls on mouse move
    let controlsTimeout;
    this.player.addEventListener('mousemove', () => {
      this.showControls();
      clearTimeout(controlsTimeout);
      controlsTimeout = setTimeout(() => this.hideControls(), 3000);
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (!this.isVisible()) return;

      switch(e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          this.togglePlay();
          break;
        case 'f':
          e.preventDefault();
          this.toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          this.toggleMute();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.seek(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.seek(10);
          break;
        case 'Escape':
          if (this.isFullscreen) {
            this.exitFullscreen();
          }
          break;
      }
    });
  }

  togglePlay() {
    if (this.video.paused) {
      this.video.play();
    } else {
      this.video.pause();
    }
  }

  seek(seconds) {
    this.video.currentTime += seconds;
  }

  toggleMute() {
    this.video.muted = !this.video.muted;
    this.updateVolumeIcon();
  }

  toggleFullscreen() {
    if (!this.isFullscreen) {
      this.enterFullscreen();
    } else {
      this.exitFullscreen();
    }
  }

  enterFullscreen() {
    const container = this.player.querySelector('.player__container');
    
    if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    } else if (container.msRequestFullscreen) {
      container.msRequestFullscreen();
    }
    
    this.isFullscreen = true;
    this.updateFullscreenIcon();
  }

  exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    
    this.isFullscreen = false;
    this.updateFullscreenIcon();
  }

  changeQuality(quality) {
    // In a real app, you would switch video sources here
    console.log('Changing quality to:', quality);
    this.currentQuality = quality;
    
    // Update UI
    this.player.querySelectorAll('.settings__option[data-quality]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.quality === quality);
    });
  }

  changePlaybackRate(rate) {
    this.video.playbackRate = rate;
  }

  updateProgress() {
    const progress = (this.video.currentTime / this.video.duration) * 100 || 0;
    const progressBar = this.player.querySelector('.player__progress-bar');
    progressBar.value = progress;
    
    const currentTime = this.formatTime(this.video.currentTime);
    this.player.querySelectorAll('.player__current-time').forEach(el => {
      el.textContent = currentTime;
    });
  }

  updateDuration() {
    const duration = this.formatTime(this.video.duration);
    this.player.querySelectorAll('.player__duration').forEach(el => {
      el.textContent = duration;
    });
  }

  updatePlayButton() {
    const icon = this.isPlaying ? 'fa-pause' : 'fa-play';
    this.player.querySelectorAll('.player__play-pause i, .player__play-pause-small i').forEach(iconEl => {
      iconEl.className = `fas ${icon}`;
    });
  }

  updateVolumeIcon() {
    const icon = this.video.muted ? 'fa-volume-mute' : 
                 this.video.volume < 0.5 ? 'fa-volume-down' : 'fa-volume-up';
    this.player.querySelector('.player__volume-btn i').className = `fas ${icon}`;
  }

  updateFullscreenIcon() {
    const icon = this.isFullscreen ? 'fa-compress' : 'fa-expand';
    this.player.querySelector('.player__fullscreen i').className = `fas ${icon}`;
  }

  showControls() {
    this.controls.style.opacity = '1';
  }

  hideControls() {
    if (this.isPlaying) {
      this.controls.style.opacity = '0';
    }
  }

  showBuffer() {
    // Show buffering indicator
  }

  hideBuffer() {
    // Hide buffering indicator
  }

  onVideoEnd() {
    // Show next episode or related content
  }

  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  show() {
    this.player.style.display = 'flex';
    this.player.setAttribute('aria-hidden', 'false');
    
    // Focus trap
    this.setupFocusTrap();
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  hide() {
    this.player.style.display = 'none';
    this.player.setAttribute('aria-hidden', 'true');
    
    this.video.pause();
    this.video.src = '';
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Return focus to previously focused element
    if (this.previousFocus) {
      this.previousFocus.focus();
    }
  }

  isVisible() {
    return this.player.style.display === 'flex';
  }

  setupFocusTrap() {
    this.previousFocus = document.activeElement;
    
    const focusableElements = this.player.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
    
    this.player.addEventListener('keydown', this.handleFocusTrap.bind(this));
  }

  handleFocusTrap(e) {
    if (e.key !== 'Tab') return;
    
    const focusableElements = this.player.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }

  showError(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'player__error';
    errorEl.innerHTML = `
      <i class="fas fa-exclamation-triangle"></i>
      <p>${message}</p>
      <button class="player__retry">Tentar novamente</button>
    `;
    
    this.player.querySelector('.player__container').appendChild(errorEl);
    
    errorEl.querySelector('.player__retry').addEventListener('click', () => {
      errorEl.remove();
      this.video.play().catch(() => this.showError(message));
    });
  }
}

export default new VideoPlayer();