/** @type {import('tailwindcss').Config} */
// ─────────────────────────────────────────────────────────────
// SISTEMA DE DISEÑO "ANDINO PREMIUM" (FoodTech)
// Aquí viven TODOS los colores. Si cambias un valor de esta
// lista, cambia en toda la aplicación.
// Regla de las escalas (para modo oscuro):
//   50–200  → fondos suaves / tintes oscuros
//   300     → bordes
//   400     → texto de color legible sobre fondo oscuro
//   500–600 → color sólido (botones)   700–950 → hover / sombras
// ─────────────────────────────────────────────────────────────
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Neutros cálidos (INVERTIDOS: 50 = más oscuro, 900 = crema)
        carbon: {
          50: '#0E0D0B',   // fondo principal (carbón profundo)
          100: '#171512',  // superficie oscura (tarjetas, paneles)
          150: '#211D18',  // superficie elevada
          200: '#3B3027',  // borde cálido
          300: '#4D3F33',
          400: '#6E5E4E',
          500: '#8F8068',
          600: '#B8AA96',  // texto secundario
          700: '#CFC2AD',
          800: '#E3D6C0',
          900: '#F2E6D2',  // crema quinoa (texto principal)
          DEFAULT: '#0E0D0B',
        },
        // Terracota andina: color PRINCIPAL de las acciones
        terracota: {
          50: '#1F130E', 100: '#2D1A13', 200: '#4A2A1E', 300: '#7A412B',
          400: '#E0896A', 500: '#C9704D', 600: '#B95C3B', 700: '#B95C3B',
          800: '#9E4A2D', 900: '#823B22', 950: '#5E2917',
          DEFAULT: '#B95C3B',
        },
        // Ocre dorado: detalles premium (usar con moderación)
        ocre: {
          50: '#1E170B', 100: '#2C2210', 200: '#4A3718', 300: '#7D5F27',
          400: '#E2B766', 500: '#D8A94F', 600: '#C99643', 700: '#B38236',
          800: '#8F6628', 900: '#6E4E1E', 950: '#4A3414',
          DEFAULT: '#C99643',
        },
        // Verde andino: estados positivos (disponible, listo)
        verde: {
          50: '#101A13', 100: '#172619', 200: '#24402B', 300: '#3A5A42',
          400: '#8DB496', 500: '#55735B', 600: '#55735B', 700: '#476150',
          800: '#3A5142', 900: '#2D4034', 950: '#1D2B23',
          DEFAULT: '#55735B',
        },
        // Rojo kantuta: alertas y situaciones críticas
        kantuta: {
          50: '#2A1015', 100: '#3A161D', 200: '#5E2430', 300: '#7F2F3E',
          400: '#E98796', 500: '#B24359', 600: '#963747', 700: '#963747',
          800: '#7C2D3A', 900: '#632430', 950: '#451A22',
          DEFAULT: '#963747',
        },
        // Azul: estado "reservada" / información
        azul: {
          50: '#0F1624', 100: '#16213A', 200: '#24365E', 300: '#31487F',
          400: '#8FADE6', 500: '#4D6FB8', 600: '#3F5E9E', 700: '#3F5E9E',
          800: '#344F85', 900: '#2A416E', 950: '#1B2A4A',
          DEFAULT: '#3F5E9E',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      borderRadius: {
        // Radios: inputs 8px · botones 10-12px · tarjetas 16px · modales 20px
        input: '8px',
        boton: '12px',
        tarjeta: '16px',
        modal: '20px',
      },
      boxShadow: {
        // Sombras oscuras y discretas (sin neón)
        warm: '0 4px 18px -4px rgba(0,0,0,0.55), 0 2px 6px -1px rgba(0,0,0,0.4)',
        'warm-lg': '0 14px 34px -6px rgba(0,0,0,0.65), 0 4px 12px -2px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
};
