import React, { useState } from 'react';
import { Utensils } from 'lucide-react';

interface Props {
  src?: string | null;
  alt: string;
  className?: string;
}

/**
 * Imagen de plato con respaldo: si la foto no existe o falla al cargar,
 * muestra un fondo con degradado y un ícono en lugar de una imagen rota.
 * Para usar fotos propias: ponlas en frontend/public/platos/ y usa
 * la ruta "/platos/nombre.jpg" (en la base de datos: columna imagen_url).
 */
export const PlatoImagen: React.FC<Props> = ({ src, alt, className = '' }) => {
  const [falla, setFalla] = useState(false);

  if (!src || falla) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-gradient-to-br from-carbon-150 via-terracota-100 to-carbon-100 text-terracota-400 ${className}`}
      >
        <Utensils className="w-1/4 h-1/4 opacity-60" />
      </div>
    );
  }
  return (
    <img src={src} alt={alt} loading="lazy" onError={() => setFalla(true)} className={className} />
  );
};
