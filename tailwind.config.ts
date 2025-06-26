import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: 'hsl(var(--card))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                muted: 'hsl(var(--muted))',
            },
            borderRadius: {
                'xl': 'calc(var(--radius, 0.75rem) + 4px)',
                'lg': 'var(--radius, 0.75rem)',
                'md': 'calc(var(--radius, 0.75rem) - 2px)',
                'sm': 'calc(var(--radius, 0.75rem) - 4px)',
            },
        },
    },
    plugins: [],
};
export default config; 