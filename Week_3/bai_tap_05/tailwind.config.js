/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                discord: {
                    background: '#36393f',
                    dark: '#2f3136',
                    darker: '#202225',
                    light: '#40444b',
                    primary: '#5865F2',
                    'primary-hover': '#4752C4',
                    'primary-light': '#7289da',
                    text: '#ffffff',
                    'text-secondary': '#b9bbbe',
                    muted: '#72767d',
                    link: '#00aff4',
                    success: '#3ba55c',
                    error: '#ed4245',
                    warning: '#faa61a',
                    divider: '#4f545c',
                }
            }
        }
    },
    plugins: [],
}
