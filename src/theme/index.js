
export const colors = {
    primary: '#0A192F',
    accent: '#D4AF37',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    text: {
        primary: '#1A1A1A',
        secondary: '#757575',
        inverse: '#FFFFFF',
        accent: '#D4AF37',
    },
    border: '#E0E0E0',
    error: '#B00020',
    success: '#4CAF50',
};

export const typography = {
    h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
    h2: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
    h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
    caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
    button: { fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
};

export const spacing = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    pill: 50,
};

export const shadows = {
    sm: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
};

export const theme = {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
};

export default theme;
