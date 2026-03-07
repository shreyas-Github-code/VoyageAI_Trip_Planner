export const clampDays = (value: number) => Math.min(30, Math.max(1, value));

export const getMatchingSuggestions = (query: string, options: string[], limit = 6) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options.slice(0, limit);
    return options.filter(option => option.toLowerCase().includes(normalizedQuery)).slice(0, limit);
};

export const parseInterests = (value: string) =>
    value
        .split(",")
        .map(part => part.trim())
        .filter(Boolean);

export const getCurrentInterestQuery = (value: string) => value.split(",").pop()?.trim() || "";

export const replaceInterestQuery = (value: string, suggestion: string) => {
    const segments = value.split(",");
    if (segments.length <= 1) return suggestion;

    const committed = segments
        .slice(0, -1)
        .map(part => part.trim())
        .filter(Boolean);

    if (committed.some(part => part.toLowerCase() === suggestion.toLowerCase())) {
        return committed.join(", ");
    }

    return [...committed, suggestion].join(", ");
};

export const getTransportIcon = (text = "") => {
    const t = text.toLowerCase();
    if (t.includes("walk")) return "🚶";
    if (t.includes("train") || t.includes("metro")) return "🚆";
    if (t.includes("bus")) return "🚌";
    if (t.includes("taxi") || t.includes("cab")) return "🚕";
    if (t.includes("auto")) return "🛺";
    if (t.includes("flight") || t.includes("air")) return "✈️";
    if (t.includes("boat") || t.includes("ferry")) return "⛴️";
    return "🚗";
};