/** @type {import('tailwindcss').Config} */
// ─────────────────────────────────────────────────────────────
// SISTEMA DE DISEÑO "NORI POLLO" (basado en el logo: rojo, amarillo, negro y blanco)
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
        // Neutros (INVERTIDOS para modo oscuro: 50 = negro del logo, 900 = blanco cálido)
        carbon: {
          50: '#0D0C0C',   // fondo principal (negro)
          100: '#161414',  // superficie (tarjetas, paneles)
          150: '#201D1D',  // superficie elevada
          200: '#332E2E',  // bordes
          300: '#473F3F',
          400: '#675E5E',
          500: '#8A8080',
          600: '#B5ABAB',  // texto secundario
          700: '#D0C8C8',
          800: '#E8E2E2',
          900: '#FFF8EE',  // texto principal (blanco cálido)
          DEFAULT: '#0D0C0C',
        },
        // ROJO Nori Pollo: color PRINCIPAL de las acciones (fondo del logo)
        rojo: {
          50: '#240B0A', 100: '#3A1210', 200: '#5E1B17', 300: '#8F2620',
          400: '#FF7B6E', 500: '#E8392F', 600: '#D91E18', 700: '#D91E18',
          800: '#B01510', 900: '#8A100C', 950: '#4A0907',
          DEFAULT: '#D91E18',
        },
        // AMARILLO Nori Pollo: letras del logo, precios y detalles destacados
        amarillo: {
          50: '#241C06', 100: '#382A08', 200: '#5C4510', 300: '#8F6C1A',
          400: '#FFD84D', 500: '#FFCB2B', 600: '#FFC21A', 700: '#E6A800',
          800: '#B88400', 900: '#8A6200', 950: '#4D3600',
          DEFAULT: '#FFC21A',
        },
        // Verde: estados positivos (disponible, listo)
        verde: {
          50: '#0F1A12', 100: '#162719', 200: '#21402A', 300: '#33603F',
          400: '#7FD39A', 500: '#2F9E58', 600: '#2F9E58', 700: '#27824A',
          800: '#1F6A3C', 900: '#185430', 950: '#0E3320',
          DEFAULT: '#2F9E58',
        },
        // Rojo oscuro: peligro, alertas y cancelaciones (distinto del rojo de marca)
        peligro: {
          50: '#2A0D12', 100: '#3D1219', 200: '#5E1B26', 300: '#85283A',
          400: '#F5A3B0', 500: '#B8324B', 600: '#9B2237', 700: '#9B2237',
          800: '#7C1B2D', 900: '#611523', 950: '#420E18',
          DEFAULT: '#9B2237',
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
