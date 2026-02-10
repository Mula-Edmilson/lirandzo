class ContentAPI {
  constructor() {
    this.baseURL = '/src/data';
    this.cache = new Map();
    this.loadingStates = new Map();
  }

  async fetchContent() {
    const cacheKey = 'all-content';
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    if (this.loadingStates.has(cacheKey)) {
      return this.loadingStates.get(cacheKey);
    }

    const promise = this._loadContent();
    this.loadingStates.set(cacheKey, promise);
    
    try {
      const content = await promise;
      this.cache.set(cacheKey, content);
      return content;
    } finally {
      this.loadingStates.delete(cacheKey);
    }
  }

  async _loadContent() {
    try {
      const [moviesRes, configRes] = await Promise.all([
        fetch(`${this.baseURL}/movies.json`),
        fetch(`${this.baseURL}/config.json`)
      ]);

      if (!moviesRes.ok || !configRes.ok) {
        throw new Error('Failed to fetch content');
      }

      const [moviesData, configData] = await Promise.all([
        moviesRes.json(),
        configRes.json()
      ]);

      return this._transformContent(moviesData, configData);
    } catch (error) {
      console.error('API Error:', error);
      return this._getFallbackContent();
    }
  }

  _transformContent(data, config) {
    return {
      movies: data.content.movies || [],
      series: data.content.series || [],
      newReleases: data.content.newReleases || [],
      featured: this._getFeaturedContent(data),
      config: config || data.config
    };
  }

  _getFeaturedContent(data) {
    const allContent = [
      ...(data.content.movies || []),
      ...(data.content.series || []),
      ...(data.content.newReleases || [])
    ];
    
    return allContent
      .filter(item => item.featured)
      .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
      .slice(0, 10);
  }

  async getContentByCategory(category) {
    const content = await this.fetchContent();
    
    switch(category) {
      case 'filmes':
        return content.movies;
      case 'series':
        return content.series;
      case 'new':
        return content.newReleases;
      case 'home':
        return content.featured;
      default:
        return [...content.movies, ...content.series];
    }
  }

  async searchContent(query) {
    const content = await this.fetchContent();
    const searchable = [...content.movies, ...content.series];
    
    return searchable.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase()) ||
      item.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
      item.id.includes(query)
    );
  }

  async getSeriesEpisodes(seriesId) {
    const content = await this.fetchContent();
    const series = content.series.find(s => s.id === seriesId);
    
    if (!series) return [];
    
    return series.seasons.flatMap(season => 
      season.episodes.map(ep => ({
        ...ep,
        seriesTitle: series.title,
        seasonNumber: season.number
      }))
    );
  }

  clearCache() {
    this.cache.clear();
  }
}

export default new ContentAPI();