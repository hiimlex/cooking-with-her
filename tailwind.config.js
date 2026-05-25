export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                mono: ['Geist Mono', 'ui-monospace', 'monospace'],
            },
            colors: {
                bg: 'var(--c-bg)',
                canvas: 'var(--c-canvas)',
                card: 'var(--c-card)',
                sunken: 'var(--c-sunken)',
                ink: 'var(--c-ink)',
                muted: 'var(--c-muted)',
                subtle: 'var(--c-subtle)',
                accent: {
                    DEFAULT: 'var(--c-accent)',
                    em: 'var(--c-accent-em)',
                    tint: 'var(--c-accent-tint)',
                },
                danger: '#ef4444',
                attention: '#f59e0b',
                success: '#22c55e',
                info: '#3b82f6',
                coral: '#ff6b6b',
                sunny: '#ffb84d',
                pink: '#ff7eb9',
                'lab-gray-bg': '#f1eef9', 'lab-gray-fg': '#6b6580',
                'lab-purple-bg': '#f3eefe', 'lab-purple-fg': '#6d28d9',
                'lab-green-bg': '#dcfce7', 'lab-green-fg': '#15803d',
                'lab-yellow-bg': '#fef3c7', 'lab-yellow-fg': '#a16207',
                'lab-orange-bg': '#ffedd5', 'lab-orange-fg': '#c2410c',
                'lab-red-bg': '#fee2e2', 'lab-red-fg': '#b91c1c',
                'lab-blue-bg': '#dbeafe', 'lab-blue-fg': '#1d4ed8',
                'lab-pink-bg': '#fce7f3', 'lab-pink-fg': '#be185d',
            },
            borderRadius: {
                '2xl': '14px',
                '3xl': '18px',
                '4xl': '22px',
            },
            backdropBlur: {
                glass: '20px',
            },
        },
    },
    plugins: [],
};
