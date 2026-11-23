/** @type {import('tailwindcss').Config} */
// ─────────────────────────────────────────────────────────────
// SISTEMA DE DISEÑO "SOL DE MEDIODÍA" (Nori Pollo)
// Fondo amarillo, tarjetas blancas, rojo y naranja de marca.
// Aquí viven TODOS los colores: si cambias un valor de esta
// lista, cambia en toda la aplicación.
// Regla de las escalas:
//   50–200  → fondos suaves / tintes claros
//   300     → bordes
//   400     → texto de color (oscuro, legible sobre fondo claro)
//   500–600 → color sólido (botones)   700–950 → hover / sombras
// ─────────────────────────────────────────────────────────────
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Neutros cálidos: 50 = fondo de la página (amarillo), 100 = tarjetas (blanco), 900 = texto (casi negro)
        carbon: {
          50: '#FFE27A',   // fondo principal de la página
          100: '#FFFFFF',  // superficie: tarjetas y paneles
          150: '#FFF3DD',  // superficie elevada
          200: '#EBD9BB',  // bordes
          300: '#D9C29A',
          400: '#B39A72',
          500: '#8C7757',
          600: '#6E5D45',  // texto secundario
          700: '#51432F',
          800: '#33291C',
          900: '#18110B',  // texto principal
          DEFAULT: '#FFE27A',
        },
        // ROJO Nori Pollo: color PRINCIPAL de las acciones (botones)
        rojo: {
          50: '#FFF1EE', 100: '#FFE0DA', 200: '#FFC4B9', 300: '#F89A8A',
          400: '#C8140E', 500: '#E02A1F', 600: '#D91E18', 700: '#D91E18',
          800: '#B01510', 900: '#8A100C', 950: '#4A0907',
          DEFAULT: '#D91E18',
        },
        // AMARILLO Nori Pollo: detalles, precios y botones dorados
        amarillo: {
          50: '#FFF9DB', 100: '#FFF0A8', 200: '#FFE57A', 300: '#FFD84D',
          400: '#9A6A00', 500: '#FFCB2B', 600: '#FFC21A', 700: '#E6A800',
          800: '#B88400', 900: '#8A6200', 950: '#4D3600',
          DEFAULT: '#FFC21A',
        },
        // Verde: estados positivos (disponible, listo, pagado)
        verde: {
          50: '#EAF8EF', 100: '#D3F0DE', 200: '#A9E0BE', 300: '#6FCB92',
          400: '#1E7A44', 500: '#2F9E58', 600: '#2F9E58', 700: '#27824A',
          800: '#1F6A3C', 900: '#185430', 950: '#0E3320',
          DEFAULT: '#2F9E58',
        },
        // Rojo oscuro: peligro, alertas y cancelaciones (distinto del rojo de marca)
        peligro: {
          50: '#FDECEF', 100: '#FAD3DA', 200: '#F4A8B5', 300: '#E87388',
          400: '#9B1B33', 500: '#B8324B', 600: '#9B2237', 700: '#9B2237',
          800: '#7C1B2D', 900: '#611523', 950: '#420E18',
          DEFAULT: '#9B2237',
        },
        // Azul: estado "reservada" / información
        azul: {
          50: '#EAF0FB', 100: '#D3E0F7', 200: '#A8C1EF', 300: '#7BA0E6',
          400: '#2D509B', 500: '#4D6FB8', 600: '#3F5E9E', 700: '#3F5E9E',
          800: '#344F85', 900: '#2A416E', 950: '#1B2A4A',
          DEFAULT: '#3F5E9E',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      borderRadius: {
        // Radios: inputs 8px · botones 12px · tarjetas 16px · modales 20px
        input: '8px',
        boton: '12px',
        tarjeta: '16px',
        modal: '20px',
      },
      boxShadow: {
        // Sombras cálidas y discretas
        warm: '0 4px 18px -4px rgba(120,60,20,0.25), 0 2px 6px -1px rgba(0,0,0,0.12)',
        'warm-lg': '0 14px 34px -6px rgba(120,60,20,0.35), 0 4px 12px -2px rgba(0,0,0,0.18)',
      },
    },
  },
  plugins: [],
};
