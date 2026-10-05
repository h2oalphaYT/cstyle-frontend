const KEY = 'cstyle-recently-viewed';
const MAX = 12;

/** Product ids the shopper viewed in this browser, most recent first. */
export const getRecentlyViewedIds = (): string[] => {
    try {
        const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
        return Array.isArray(parsed) ? parsed.filter(x => typeof x === 'string').slice(0, MAX) : [];
    } catch {
        return [];
    }
};

export const pushRecentlyViewed = (id: string) => {
    const next = [id, ...getRecentlyViewedIds().filter(x => x !== id)].slice(0, MAX);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
};
