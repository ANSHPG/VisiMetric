export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#76b900',
        'on-primary': '#000000',
        'primary-dark': '#5a8d00',
        ink: '#000000',
        canvas: '#ffffff',
        'surface-dark': '#000000',
        'surface-soft': '#f7f7f7',
        'surface-elevated': '#1a1a1a',
        hairline: '#cccccc',
        'hairline-strong': '#5e5e5e',
        body: '#1a1a1a',
        mute: '#757575',
        stone: '#898989',
        ash: '#a7a7a7',
        'on-dark': '#ffffff',
        error: '#e52020',
        warning: '#df6500',
        'success-deep': '#3f8500',
      },
      fontFamily: {
        nvidia: ['"NVIDIA-EMEA"', 'Arial', 'Helvetica', 'sans-serif'],
      },
      borderRadius: {
        none: '0px',
        xs: '1px',
        sm: '2px',
        full: '9999px',
      },
      spacing: {
        xxs: '2px',
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        xxl: '32px',
        section: '64px',
      },
      boxShadow: {
        sticky: '0 0 5px 0 rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
}
