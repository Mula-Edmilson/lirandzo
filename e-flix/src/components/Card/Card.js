export class Card {
  constructor(content, options = {}) {
    this.content = content;
    this.options = {
      variant: options.variant || 'default',
      size: options.size || 'medium',
      showWatchlist: options.showWatchlist !== false,
      lazyLoad: options.lazyLoad !== false,
      ...options
    };

    this.element = null;
    this.intersectionObserver = null;
    this.isInViewport = false;
  }

  render() {
    const element = document.createElement('div');
    element.className = this._getCardClasses();
    element.setAttribute('role', 'article');
    element.setAttribute('aria-label', `${this.content.title} - ${this.content.description || 'Conteúdo disponível'}`);
    element.tabIndex = 0;

    element.innerHTML = this._getCardHTML();

    this.element = element;

    if (this.options.lazyLoad) {
      this._setupLazyLoading();
    }

    this._attachEventListeners();

    return element;
  }

  _getCardClasses() {
    const classes = [
      'card',
      `card--${this.options.variant}`,
      `card--${this.options.size}`,
      this.content.featured ? 'card--featured' : '',
      this.options.interactive ? 'card--interactive' : ''
    ];

    return classes.filter(Boolean).join(' ');
  }

  _getCardHTML() {
    const isSeries = this.content.category === 'series';
    const watchlistActive = storage.isInWatchlist(this.content.id) ? 'active' : '';

    return `
      <div class="card__inner">
        <div class="card__media">
          ${this._getThumbnailHTML()}
          ${this._getOverlayHTML()}
        </div>
        
        <div class="card__content">
          <div class="card__header">
            ${this._getBadgeHTML()}
            ${this.options.showWatchlist ? this._getWatchlistButtonHTML(watchlistActive) : ''}
          </div>
          
          <h3 class="card__title">${this.content.title}</h3>
          
          ${this.content.description ? `
            <p class="card__description">${this.content.description.substring(0, 100)}...</p>
          ` : ''}
          
          <div class="card__footer">
            ${this._getMetadataHTML()}
            ${this._getActionButtonHTML(isSeries)}
          </div>
        </div>
      </div>
      
      <div class="card__skeleton" aria-hidden="true">
        <div class="skeleton skeleton--image"></div>
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text skeleton--short"></div>
      </div>
    `;
  }

  _getThumbnailHTML() {
    if (this.options.lazyLoad) {
      return `
        <img 
          class="card__image lazy" 
          data-src="${this.content.thumbnail}" 
          alt="${this.content.title}"
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop'"
        >
      `;
    }

    return `
      <img 
        class="card__image" 
        src="${this.content.thumbnail}" 
        alt="${this.content.title}"
        loading="lazy"
        onerror="this.src='https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop'"
      >
    `;
  }

  _getOverlayHTML() {
    return `
      <div class="card__overlay">
        <button class="card__play" aria-label="Reproduzir ${this.content.title}">
          <i class="fas fa-play" aria-hidden="true"></i>
        </button>
        
        ${this.content.rating ? `
          <span class="card__rating">
            <i class="fas fa-star" aria-hidden="true"></i>
            ${this.content.rating}
          </span>
        ` : ''}
        
        ${this.content.duration ? `
          <span class="card__duration">${this.content.duration}</span>
        ` : ''}
      </div>
    `;
  }

  _getBadgeHTML() {
    if (this.content.category === 'new') {
      return `<span class="card__badge badge--new">2025</span>`;
    }
    
    if (this.content.featured) {
      return `<span class="card__badge badge--featured">Destaque</span>`;
    }
    
    return '';
  }

  _getWatchlistButtonHTML(activeClass) {
    return `
      <button 
        class="card__watchlist ${activeClass}" 
        aria-label="${activeClass ? 'Remover da' : 'Adicionar à'} lista de observação"
        data-content-id="${this.content.id}"
      >
        <i class="fas ${activeClass ? 'fa-check' : 'fa-plus'}" aria-hidden="true"></i>
      </button>
    `;
  }

  _getMetadataHTML() {
    const metadata = [];
    
    if (this.content.year) {
      metadata.push(`<span class="card__year">${this.content.year}</span>`);
    }
    
    if (this.content.genres && this.content.genres.length > 0) {
      metadata.push(`<span class="card__genre">${this.content.genres[0]}</span>`);
    }
    
    return metadata.join('');
  }

  _getActionButtonHTML(isSeries) {
    const label = isSeries ? 'Ver episódios' : 'Assistir agora';
    const icon = isSeries ? 'fa-list' : 'fa-play';
    
    return `
      <button class="card__action" aria-label="${label}">
        <i class="fas ${icon}" aria-hidden="true"></i>
        ${label}
      </button>
    `;
  }

  _setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.isInViewport) {
            this.isInViewport = true;
            this._loadLazyContent();
            this.intersectionObserver.unobserve(this.element);
          }
        });
      }, {
        rootMargin: '100px',
        threshold: 0.1
      });

      this.intersectionObserver.observe(this.element);
    } else {
      this._loadLazyContent();
    }
  }

  _loadLazyContent() {
    const lazyImage = this.element.querySelector('.lazy');
    if (lazyImage && lazyImage.dataset.src) {
      lazyImage.src = lazyImage.dataset.src;
      lazyImage.classList.remove('lazy');
    }
    
    this.element.querySelector('.card__skeleton').style.display = 'none';
  }

  _attachEventListeners() {
    if (!this.element) return;

    // Play button
    const playButton = this.element.querySelector('.card__play');
    if (playButton) {
      playButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this._handlePlay();
      });
    }

    // Watchlist button
    const watchlistButton = this.element.querySelector('.card__watchlist');
    if (watchlistButton) {
      watchlistButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this._handleWatchlistToggle();
      });
    }

    // Card click
    this.element.addEventListener('click', () => this._handleCardClick());
    this.element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this._handleCardClick();
      }
    });
  }

  _handlePlay() {
    if (this.content.category === 'series') {
      window.dispatchEvent(new CustomEvent('open-series-drawer', {
        detail: { seriesId: this.content.id }
      }));
    } else {
      window.dispatchEvent(new CustomEvent('play-video', {
        detail: { 
          url: this.content.videoUrl || this.content.video,
          title: this.content.title,
          metadata: this.content
        }
      }));
    }
  }

  _handleWatchlistToggle() {
    storage.toggleWatchlist(this.content.id);
    
    const watchlistButton = this.element.querySelector('.card__watchlist');
    if (watchlistButton) {
      const isActive = storage.isInWatchlist(this.content.id);
      watchlistButton.classList.toggle('active', isActive);
      watchlistButton.innerHTML = `
        <i class="fas ${isActive ? 'fa-check' : 'fa-plus'}" aria-hidden="true"></i>
      `;
      watchlistButton.setAttribute('aria-label', 
        `${isActive ? 'Remover da' : 'Adicionar à'} lista de observação`
      );
    }
  }

  _handleCardClick() {
    window.dispatchEvent(new CustomEvent('card-click', {
      detail: { content: this.content }
    }));
  }

  destroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}

export class CardSkeleton {
  constructor(count = 1, variant = 'default') {
    this.count = count;
    this.variant = variant;
  }

  render() {
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < this.count; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = `card card--skeleton card--${this.variant}`;
      skeleton.setAttribute('aria-hidden', 'true');
      
      skeleton.innerHTML = `
        <div class="card__skeleton">
          <div class="skeleton skeleton--image"></div>
          <div class="skeleton skeleton--text"></div>
          <div class="skeleton skeleton--text skeleton--short"></div>
          <div class="skeleton skeleton--button"></div>
        </div>
      `;
      
      fragment.appendChild(skeleton);
    }
    
    return fragment;
  }
}