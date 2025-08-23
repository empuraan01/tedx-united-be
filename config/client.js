function normalizeClientOrigin(rawValue) {
    const fallback = 'http://localhost:3000';
    const value = (rawValue && typeof rawValue === 'string' && rawValue.trim()) ? rawValue.trim() : fallback;

    const hasProtocol = /^https?:\/\//i.test(value);
    const protocol = process.env.NODE_ENV === 'production' ? 'https://' : 'http://';

    const originWithProtocol = hasProtocol ? value : `${protocol}${value}`;

    return originWithProtocol.replace(/\/$/, '');
}

function getClientOrigin() {
    return normalizeClientOrigin(process.env.CLIENT_URL);
}

module.exports = {
    getClientOrigin,
    normalizeClientOrigin
};


