// ==================== DATA STORAGE ====================
class StorageService {
    constructor() {
        this.WATCHLIST_KEY = 'e-flix-watchlist';
        this.RECENT_KEY = 'e-flix-recent';
        this.SETTINGS_KEY = 'e-flix-settings';
    }

    getWatchlist() {
        const watchlist = localStorage.getItem(this.WATCHLIST_KEY);
        return watchlist ? JSON.parse(watchlist) : [];
    }

    addToWatchlist(contentId) {
        const watchlist = this.getWatchlist();
        if (!watchlist.includes(contentId)) {
            watchlist.push(contentId);
            localStorage.setItem(this.WATCHLIST_KEY, JSON.stringify(watchlist));
            this.dispatchWatchlistUpdate(contentId, 'added');
        }
        return watchlist;
    }

    removeFromWatchlist(contentId) {
        let watchlist = this.getWatchlist();
        watchlist = watchlist.filter(id => id !== contentId);
        localStorage.setItem(this.WATCHLIST_KEY, JSON.stringify(watchlist));
        this.dispatchWatchlistUpdate(contentId, 'removed');
        return watchlist;
    }

    isInWatchlist(contentId) {
        return this.getWatchlist().includes(contentId);
    }

    toggleWatchlist(contentId) {
        if (this.isInWatchlist(contentId)) {
            return this.removeFromWatchlist(contentId);
        } else {
            return this.addToWatchlist(contentId);
        }
    }

    dispatchWatchlistUpdate(contentId, action) {
        window.dispatchEvent(new CustomEvent('watchlist-update', {
            detail: { contentId, action }
        }));
    }

    clearWatchlist() {
        localStorage.removeItem(this.WATCHLIST_KEY);
        window.dispatchEvent(new CustomEvent('watchlist-update', {
            detail: { action: 'cleared' }
        }));
    }
}

const storage = new StorageService();

// ==================== VIDEO LIBRARY ====================
const videoLibrary = [
    // LANÇAMENTOS 2025
    { id: "6330", t: "A Mão Que Balança o Berço", u: "http://cinetop.co.mz:8330/film/AMaoQueBalancaoBerco2025.mp4", cat: "new", tag: "2025", series: null, thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop", rating: 7.5, year: 2025 },
    { id: "6331", t: "Quem é Morto Sempre Aparece", u: "http://cinetop.co.mz:8330/film/QuemeMortoSempreAparece2025.mp4", cat: "new", tag: "2025", series: null, thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop", rating: 6.8, year: 2025 },
    { id: "6332", t: "Mouseboat: Massacre no Barco", u: "http://cinetop.co.mz:8330/film/MouseboatMassacrenoBarco2025.mp4", cat: "new", tag: "2025", series: null, thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop", rating: 5.9, year: 2025 },
    { id: "6333", t: "Um Dia Fora de Controle", u: "http://cinetop.co.mz:8330/film/UmDiaForadeControle2025.mp4", cat: "new", tag: "2025", series: null, thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop", rating: 7.2, year: 2025 },
    { id: "6335", t: "Hedda", u: "http://cinetop.co.mz:8330/film/Hedda2025.mp4", cat: "new", tag: "2025", series: null, thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop", rating: 8.1, year: 2025 },

    // SÉRIES (AGRUPÁVEIS)
    { id: "5000", t: "The Mandalorian - T03 E22", u: "http://cinetop.co.mz:8330/film/TheMandalorianSeason3Eps22.MP4", cat: "series", tag: "Star Wars", series: "The Mandalorian", thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&h=450&fit=crop", rating: 8.7, year: 2023 },
    { id: "5002", t: "Episódio 01", u: "http://cinetop.co.mz:8330/film/ParasyteEpisode1Metamorphosis.MP4", cat: "series", tag: "Anime", series: "Parasyte", thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop", rating: 8.5, year: 2014 },
    { id: "5003", t: "Episódio 02", u: "http://cinetop.co.mz:8330/film/ParasyteEpisode2DemonintheFlesh.MP4", cat: "series", tag: "Anime", series: "Parasyte", thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop", rating: 8.6, year: 2014 },
    { id: "5004", t: "Episódio 03", u: "http://cinetop.co.mz:8330/film/ParasyteEpisode3Feast.MP4", cat: "series", tag: "Anime", series: "Parasyte", thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop", rating: 8.7, year: 2014 },
    { id: "5032", t: "S01 E01 - Last Day", u: "http://cinetop.co.mz:8330/film/FBIInternationalSeason1Episode1.MP4", cat: "series", tag: "Crime", series: "Invasion", thumbnail: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=300&h=450&fit=crop", rating: 7.3, year: 2021 },
    { id: "5033", t: "S01 E02 - Crash", u: "http://cinetop.co.mz:8330/film/InvasionSeason1Episode2Crash.MP4", cat: "series", tag: "Crime", series: "Invasion", thumbnail: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=300&h=450&fit=crop", rating: 7.4, year: 2021 },
    { id: "5064", t: "S01 E01", u: "http://cinetop.co.mz:8330/film/CitadelSeason1Episode1TheHumanEnigma.MP4", cat: "series", tag: "Spy", series: "Citadel", thumbnail: "https://images.unsplash.com/photo-1551029506-0807df4e2031?w=300&h=450&fit=crop", rating: 6.9, year: 2023 },
    { id: "5065", t: "Episódio 01", u: "http://cinetop.co.mz:8330/film/TheChangelingEpisode1FirstComesLove.MP4", cat: "series", tag: "Drama", series: "The Changeling", thumbnail: "https://images.unsplash.com/photo-1551029506-0807df4e2031?w=300&h=450&fit=crop", rating: 7.8, year: 2023 },
    { id: "5066", t: "Episódio 02", u: "http://cinetop.co.mz:8330/film/TheChangelingEpisode2ThenComesaBabyinaBabyCarriage.MP4", cat: "series", tag: "Drama", series: "The Changeling", thumbnail: "https://images.unsplash.com/photo-1551029506-0807df4e2031?w=300&h=450&fit=crop", rating: 7.9, year: 2023 },

    // FILMES
    { id: "5028", t: "Creed III", u: "http://cinetop.co.mz:8330/film/CreedIII2023.MP4", cat: "filmes", tag: "Drama", series: null, thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop", rating: 7.2, year: 2023 },
    { id: "5029", t: "Shazam! Fúria dos Deuses", u: "http://cinetop.co.mz:8330/film/Shazam2023.MP4", cat: "filmes", tag: "Ação", series: null, thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop", rating: 6.1, year: 2023 },
    { id: "5062", t: "Homem-Formiga: Quantumania", u: "http://cinetop.co.mz:8330/film/AssistirHomemFormigaeaVespaQuantumania2023.mp4", cat: "filmes", tag: "Marvel", series: null, thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&h=450&fit=crop", rating: 6.0, year: 2023 },
    { id: "5067", t: "Pânico VI", u: "http://cinetop.co.mz:8330/film/PanicoVI2023.MP4", cat: "filmes", tag: "Terror", series: null, thumbnail: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=300&h=450&fit=crop", rating: 6.3, year: 2023 },
    { id: "5069", t: "Dungeons & Dragons", u: "http://cinetop.co.mz:8330/film/DungeonsDragonsHonraEntreRebeldes2023.MP4", cat: "filmes", tag: "Fantasia", series: null, thumbnail: "https://images.unsplash.com/photo-1551029506-0807df4e2031?w=300&h=450&fit=crop", rating: 7.3, year: 2023 }
];

// ==================== CARD COMPONENT ====================
class Card {
    constructor(content, options = {}) {
        this.content = content;
        this.options = {
            showWatchlist: options.showWatchlist !== false,
            lazyLoad: options.lazyLoad !== false,
            ...options
        };
        this.element = null;
    }

    render() {
        const element = document.createElement('div');
        element.className = 'card';
        element.setAttribute('role', 'article');
        element.setAttribute('aria-label', `${this.content.t} - ${this.content.tag}`);
        element.tabIndex = 0;

        const isSeries = this.content.series !== null;
        const watchlistActive = storage.isInWatchlist(this.content.id) ? 'active' : '';
        const thumbnail = this.content.thumbnail || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop';

        element.innerHTML = `
            <div class="card__inner">
                <div class="card__media">
                    <img class="card__image lazy" 
                         data-src="${thumbnail}" 
                         alt="${this.content.t}"
                         loading="lazy">
                    <div class="card__overlay">
                        <button class="card__play" aria-label="Reproduzir ${this.content.t}">
                            <i class="fas fa-play" aria-hidden="true"></i>
                        </button>
                        ${this.content.rating ? `
                            <span class="card__rating">
                                <i class="fas fa-star" aria-hidden="true"></i>
                                ${this.content.rating}
                            </span>
                        ` : ''}
                    </div>
                </div>
                
                <div class="card__content">
                    <div class="card__header">
                        ${this.content.cat === 'new' ? `<span class="card__badge badge--new">2025</span>` : ''}
                        ${this.options.showWatchlist ? `
                            <button class="card__watchlist ${watchlistActive}" 
                                    aria-label="${watchlistActive ? 'Remover da' : 'Adicionar à'} lista de observação"
                                    data-content-id="${this.content.id}">
                                <i class="fas ${watchlistActive ? 'fa-check' : 'fa-plus'}" aria-hidden="true"></i>
                            </button>
                        ` : ''}
                    </div>
                    
                    <h3 class="card__title">${this.content.t}</h3>
                    
                    <div class="card__footer">
                        <span class="card__tag">${this.content.tag}</span>
                        ${this.content.year ? `<span class="card__year">${this.content.year}</span>` : ''}
                        <button class="card__action" aria-label="${isSeries ? 'Ver episódios' : 'Assistir agora'}">
                            ${isSeries ? 'Ver episódios' : 'Assistir'}
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="card__skeleton">
                <div class="skeleton skeleton--image"></div>
                <div class="skeleton skeleton--text"></div>
                <div class="skeleton skeleton--text skeleton--short"></div>
            </div>
        `;

        this.element = element;
        this._setupLazyLoading();
        this._attachEventListeners();
        return element;
    }

    _setupLazyLoading() {
        const img = this.element.querySelector('.lazy');
        if (img && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                        }
                        this.element.querySelector('.card__skeleton').style.display = 'none';
                        observer.unobserve(img);
                    }
                });
            }, { rootMargin: '100px' });
            
            observer.observe(img);
        } else if (img && img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            this.element.querySelector('.card__skeleton').style.display = 'none';
        }
    }

    _attachEventListeners() {
        // Play button
        const playBtn = this.element.querySelector('.card__play');
        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this._handlePlay();
            });
        }

        // Watchlist button
        const watchlistBtn = this.element.querySelector('.card__watchlist');
        if (watchlistBtn) {
            watchlistBtn.addEventListener('click', (e) => {
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
        if (this.content.series) {
            window.dispatchEvent(new CustomEvent('open-series-drawer', {
                detail: { seriesName: this.content.series }
            }));
        } else {
            window.dispatchEvent(new CustomEvent('play-video', {
                detail: { 
                    url: this.content.u,
                    title: this.content.t
                }
            }));
        }
    }

    _handleWatchlistToggle() {
        storage.toggleWatchlist(this.content.id);
        const watchlistBtn = this.element.querySelector('.card__watchlist');
        if (watchlistBtn) {
            const isActive = storage.isInWatchlist(this.content.id);
            watchlistBtn.classList.toggle('active', isActive);
            watchlistBtn.innerHTML = `<i class="fas ${isActive ? 'fa-check' : 'fa-plus'}" aria-hidden="true"></i>`;
            watchlistBtn.setAttribute('aria-label', 
                `${isActive ? 'Remover da' : 'Adicionar à'} lista de observação`
            );
        }
    }

    _handleCardClick() {
        if (this.content.series) {
            window.dispatchEvent(new CustomEvent('open-series-drawer', {
                detail: { seriesName: this.content.series }
            }));
        } else {
            window.dispatchEvent(new CustomEvent('play-video', {
                detail: { 
                    url: this.content.u,
                    title: this.content.t
                }
            }));
        }
    }
}

// ==================== MAIN APPLICATION ====================
class EFlixApp {
    constructor() {
        this.currentTab = 'home';
        this.isMobile = window.innerWidth <= 768;
        this.gridContainers = new Map();
        this.observers = new Map();
        
        this.init();
    }

    async init() {
        // Hide loading screen
        setTimeout(() => {
            const loading = document.getElementById('app-loading');
            if (loading) loading.style.display = 'none';
        }, 500);

        this.cacheElements();
        this.setupEventListeners();
        this.render();
        this.updateWatchlistBadges();
        
        // Load initial content
        this.loadContent('home');
    }

    cacheElements() {
        this.elements = {
            // Mobile menu
            mobileMenuToggle: document.getElementById('mobileMenuToggle'),
            closeMobileMenu: document.getElementById('closeMobileMenu'),
            mobileNav: document.getElementById('mobileNav'),
            
            // Watchlist buttons
            watchlistBtnMobile: document.getElementById('watchlistBtnMobile'),
            watchlistBtnDesktop: document.getElementById('watchlistBtnDesktop'),
            watchlistBadge: document.getElementById('watchlist-badge'),
            mobileWatchlistBadge: document.getElementById('mobile-watchlist-badge'),
            
            // Tabs
            navItems: document.querySelectorAll('.nav-item'),
            mobileNavItems: document.querySelectorAll('.mobile-nav-item'),
            
            // Content containers
            gridHome: document.getElementById('grid-home'),
            gridFilmes: document.getElementById('grid-filmes'),
            gridSeries: document.getElementById('grid-series'),
            gridNew: document.getElementById('grid-new'),
            gridWatchlist: document.getElementById('grid-watchlist'),
            
            // Search
            globalSearch: document.getElementById('globalSearch'),
            searchInputHero: document.getElementById('searchInputHero'),
            
            // Drawer
            drawer: document.getElementById('ep-drawer'),
            closeDrawerBtn: document.getElementById('closeDrawerBtn'),
            epList: document.getElementById('ep-list'),
            seriesTitle: document.getElementById('series-title'),
            
            // Player
            player: document.getElementById('player'),
            closePlayerBtn: document.getElementById('closePlayerBtn'),
            videoElement: document.getElementById('v-element')
        };

        // Cache grid containers
        this.gridContainers.set('home', this.elements.gridHome);
        this.gridContainers.set('filmes', this.elements.gridFilmes);
        this.gridContainers.set('series', this.elements.gridSeries);
        this.gridContainers.set('new', this.elements.gridNew);
        this.gridContainers.set('watchlist', this.elements.gridWatchlist);
    }

    setupEventListeners() {
        // Mobile menu
        if (this.elements.mobileMenuToggle) {
            this.elements.mobileMenuToggle.addEventListener('click', () => this.toggleMobileMenu());
        }
        if (this.elements.closeMobileMenu) {
            this.elements.closeMobileMenu.addEventListener('click', () => this.toggleMobileMenu(false));
        }

        // Watchlist buttons
        if (this.elements.watchlistBtnMobile) {
            this.elements.watchlistBtnMobile.addEventListener('click', () => this.showWatchlist());
        }
        if (this.elements.watchlistBtnDesktop) {
            this.elements.watchlistBtnDesktop.addEventListener('click', () => this.showWatchlist());
        }

        // Navigation
        this.elements.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = item.dataset.tab;
                if (tab) this.switchTab(tab, item);
            });
        });

        this.elements.mobileNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = item.dataset.tab;
                if (tab) {
                    this.switchTab(tab);
                    this.toggleMobileMenu(false);
                }
            });
        });

        // Search
        if (this.elements.globalSearch) {
            this.elements.globalSearch.addEventListener('input', this.debounce(() => this.handleSearch(), 300));
        }
        if (this.elements.searchInputHero) {
            this.elements.searchInputHero.addEventListener('input', this.debounce(() => this.handleSearch(), 300));
        }

        // Drawer
        if (this.elements.closeDrawerBtn) {
            this.elements.closeDrawerBtn.addEventListener('click', () => this.closeDrawer());
        }

        // Player
        if (this.elements.closePlayerBtn) {
            this.elements.closePlayerBtn.addEventListener('click', () => this.closePlayer());
        }

        // Global events
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('play-video', (e) => this.playVideo(e.detail));
        window.addEventListener('open-series-drawer', (e) => this.openSeriesDrawer(e.detail.seriesName));
        window.addEventListener('watchlist-update', () => this.updateWatchlistBadges());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // ESC to close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    loadContent(category) {
        const container = this.gridContainers.get(category);
        if (!container) return;

        // Show skeleton loading
        this.showSkeleton(container, category === 'watchlist' ? 3 : 6);

        // Simulate loading delay
        setTimeout(() => {
            this.renderContent(category, container);
        }, 300);
    }

    showSkeleton(container, count = 6) {
        container.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'card card--skeleton';
            skeleton.setAttribute('aria-hidden', 'true');
            skeleton.innerHTML = `
                <div class="card__skeleton">
                    <div class="skeleton skeleton--image"></div>
                    <div class="skeleton skeleton--text"></div>
                    <div class="skeleton skeleton--text skeleton--short"></div>
                    <div class="skeleton skeleton--button"></div>
                </div>
            `;
            container.appendChild(skeleton);
        }
    }

    renderContent(category, container) {
        container.innerHTML = '';

        let contentToShow = [];
        
        if (category === 'watchlist') {
            const watchlistIds = storage.getWatchlist();
            contentToShow = videoLibrary.filter(item => watchlistIds.includes(item.id));
        } else if (category === 'series') {
            // Group series
            const seriesMap = {};
            videoLibrary.forEach(item => {
                if (item.series && item.cat === 'series') {
                    if (!seriesMap[item.series]) {
                        seriesMap[item.series] = item;
                    }
                }
            });
            contentToShow = Object.values(seriesMap);
        } else {
            contentToShow = videoLibrary.filter(item => {
                if (category === 'home') {
                    return item.cat === 'new' || parseInt(item.id) > 5060;
                }
                return item.cat === category;
            });
        }

        if (contentToShow.length === 0) {
            this.showEmptyState(container, category);
            return;
        }

        const fragment = document.createDocumentFragment();
        
        contentToShow.forEach(item => {
            const card = new Card(item, {
                showWatchlist: true,
                lazyLoad: true
            });
            fragment.appendChild(card.render());
        });
        
        container.appendChild(fragment);
    }

    showEmptyState(container, category) {
        const messages = {
            home: 'Nenhum conteúdo disponível',
            filmes: 'Nenhum filme disponível',
            series: 'Nenhuma série disponível',
            new: 'Nenhum lançamento disponível',
            watchlist: 'Sua lista de observação está vazia'
        };
        
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-film" aria-hidden="true"></i>
                <h3>${messages[category] || 'Nenhum conteúdo encontrado'}</h3>
                <p>Tente explorar outras categorias</p>
            </div>
        `;
    }

    switchTab(tab, element = null) {
        this.currentTab = tab;
        
        // Update navigation
        this.elements.navItems.forEach(item => {
            item.classList.remove('active');
            item.setAttribute('aria-selected', 'false');
        });
        
        this.elements.mobileNavItems.forEach(item => {
            item.classList.remove('active');
        });
        
        if (element) {
            element.classList.add('active');
            element.setAttribute('aria-selected', 'true');
        }
        
        // Show active tab
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active');
            section.setAttribute('aria-hidden', 'true');
        });
        
        const targetSection = document.getElementById(`tab-${tab}`);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.setAttribute('aria-hidden', 'false');
        }
        
        // Load content for tab
        this.loadContent(tab);
    }

    showWatchlist() {
        this.switchTab('watchlist');
        this.toggleMobileMenu(false);
    }

    async openSeriesDrawer(seriesName) {
        if (!this.elements.drawer || !this.elements.epList) return;

        // Filter episodes for this series
        const episodes = videoLibrary.filter(item => 
            item.series === seriesName && item.cat === 'series'
        );

        if (episodes.length === 0) return;

        // Update drawer title
        this.elements.seriesTitle.textContent = seriesName;
        
        // Clear and populate episode list
        this.elements.epList.innerHTML = '';
        
        episodes.forEach(episode => {
            const epElement = document.createElement('div');
            epElement.className = 'ep-item';
            epElement.tabIndex = 0;
            epElement.setAttribute('role', 'button');
            epElement.setAttribute('aria-label', `Assistir ${episode.t}`);
            
            epElement.innerHTML = `
                <div class="ep-item__content">
                    <div class="ep-item__info">
                        <h4 class="ep-item__title">${episode.t}</h4>
                        <p class="ep-item__meta">${episode.tag} • ${episode.rating || 'NR'}</p>
                    </div>
                </div>
                <button class="ep-item__play" aria-label="Reproduzir">
                    <i class="fas fa-play"></i>
                </button>
            `;
            
            epElement.addEventListener('click', () => {
                this.playVideo({
                    url: episode.u,
                    title: `${seriesName} - ${episode.t}`
                });
                this.closeDrawer();
            });
            
            this.elements.epList.appendChild(epElement);
        });
        
        // Show drawer
        this.showDrawer();
    }

    showDrawer() {
        if (this.elements.drawer) {
            this.elements.drawer.classList.add('active');
            this.elements.drawer.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
    }

    closeDrawer() {
        if (this.elements.drawer) {
            this.elements.drawer.classList.remove('active');
            this.elements.drawer.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }

    playVideo(detail) {
        if (!this.elements.player || !this.elements.videoElement) return;

        this.elements.videoElement.src = detail.url;
        this.elements.videoElement.setAttribute('aria-label', `Reproduzindo: ${detail.title}`);
        
        this.elements.player.style.display = 'flex';
        this.elements.player.setAttribute('aria-hidden', 'false');
        
        // Try to play
        const playPromise = this.elements.videoElement.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error('Erro ao reproduzir vídeo:', error);
                alert('Não foi possível reproduzir o vídeo. Verifique a conexão ou tente outro conteúdo.');
            });
        }
    }

    closePlayer() {
        if (!this.elements.player || !this.elements.videoElement) return;
        
        this.elements.player.style.display = 'none';
        this.elements.player.setAttribute('aria-hidden', 'true');
        this.elements.videoElement.pause();
        this.elements.videoElement.src = '';
    }

    toggleMobileMenu(show) {
        if (show === undefined) {
            show = !this.elements.mobileNav.classList.contains('active');
        }
        
        if (show) {
            this.elements.mobileNav.classList.add('active');
            this.elements.mobileNav.setAttribute('aria-hidden', 'false');
            if (this.elements.mobileMenuToggle) {
                this.elements.mobileMenuToggle.setAttribute('aria-expanded', 'true');
            }
            document.body.style.overflow = 'hidden';
        } else {
            this.elements.mobileNav.classList.remove('active');
            this.elements.mobileNav.setAttribute('aria-hidden', 'true');
            if (this.elements.mobileMenuToggle) {
                this.elements.mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
            document.body.style.overflow = '';
        }
    }

    handleSearch() {
        const searchTerm = (this.elements.globalSearch?.value || this.elements.searchInputHero?.value || '').toLowerCase();
        
        if (searchTerm.length < 2) {
            this.loadContent(this.currentTab);
            return;
        }

        const container = this.gridContainers.get(this.currentTab);
        if (!container) return;

        const results = videoLibrary.filter(item => 
            item.t.toLowerCase().includes(searchTerm) ||
            item.tag.toLowerCase().includes(searchTerm) ||
            (item.series && item.series.toLowerCase().includes(searchTerm)) ||
            item.id.includes(searchTerm)
        );

        if (results.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search" aria-hidden="true"></i>
                    <h3>Nenhum resultado encontrado</h3>
                    <p>Tente usar palavras-chave diferentes</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        const fragment = document.createDocumentFragment();
        
        results.forEach(item => {
            const card = new Card(item, {
                showWatchlist: true,
                lazyLoad: false
            });
            fragment.appendChild(card.render());
        });
        
        container.appendChild(fragment);
    }

    updateWatchlistBadges() {
        const watchlistCount = storage.getWatchlist().length;
        
        if (this.elements.watchlistBadge) {
            this.elements.watchlistBadge.textContent = watchlistCount;
            this.elements.watchlistBadge.style.display = watchlistCount > 0 ? 'flex' : 'none';
        }
        
        if (this.elements.mobileWatchlistBadge) {
            this.elements.mobileWatchlistBadge.textContent = watchlistCount;
            this.elements.mobileWatchlistBadge.style.display = watchlistCount > 0 ? 'inline' : 'none';
        }
    }

    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        if (wasMobile !== this.isMobile) {
            this.render();
        }
    }

    closeAllModals() {
        this.closeDrawer();
        this.toggleMobileMenu(false);
        this.closePlayer();
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    render() {
        // Update responsive classes if needed
        document.body.classList.toggle('is-mobile', this.isMobile);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.eFlixApp = new EFlixApp();
});