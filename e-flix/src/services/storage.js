class StorageService {
  constructor() {
    this.WATCHLIST_KEY = 'e-flix-watchlist';
    this.RECENT_KEY = 'e-flix-recent';
    this.SETTINGS_KEY = 'e-flix-settings';
  }

  // Watchlist Management
  getWatchlist() {
    const watchlist = localStorage.getItem(this.WATCHLIST_KEY);
    return watchlist ? JSON.parse(watchlist) : [];
  }

  addToWatchlist(contentId) {
    const watchlist = this.getWatchlist();
    
    if (!watchlist.includes(contentId)) {
      watchlist.push(contentId);
      localStorage.setItem(this.WATCHLIST_KEY, JSON.stringify(watchlist));
      this._dispatchWatchlistUpdate(contentId, 'added');
    }
    
    return watchlist;
  }

  removeFromWatchlist(contentId) {
    let watchlist = this.getWatchlist();
    watchlist = watchlist.filter(id => id !== contentId);
    
    localStorage.setItem(this.WATCHLIST_KEY, JSON.stringify(watchlist));
    this._dispatchWatchlistUpdate(contentId, 'removed');
    
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

  // Recent Content
  addRecent(content) {
    const recent = this.getRecent();
    const filteredRecent = recent.filter(item => item.id !== content.id);
    
    filteredRecent.unshift({
      id: content.id,
      title: content.title,
      type: content.category,
      thumbnail: content.thumbnail,
      timestamp: new Date().toISOString()
    });
    
    const limitedRecent = filteredRecent.slice(0, 20);
    localStorage.setItem(this.RECENT_KEY, JSON.stringify(limitedRecent));
    
    return limitedRecent;
  }

  getRecent() {
    const recent = localStorage.getItem(this.RECENT_KEY);
    return recent ? JSON.parse(recent) : [];
  }

  // User Settings
  getSettings() {
    const settings = localStorage.getItem(this.SETTINGS_KEY);
    return settings ? JSON.parse(settings) : {
      theme: 'dark',
      autoplay: false,
      quality: '1080p',
      volume: 0.7,
      subtitles: 'pt'
    };
  }

  saveSettings(settings) {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    this._dispatchSettingsUpdate(settings);
  }

  // Event Dispatching
  _dispatchWatchlistUpdate(contentId, action) {
    window.dispatchEvent(new CustomEvent('watchlist-update', {
      detail: { contentId, action }
    }));
  }

  _dispatchSettingsUpdate(settings) {
    window.dispatchEvent(new CustomEvent('settings-update', {
      detail: { settings }
    }));
  }
}

export default new StorageService();