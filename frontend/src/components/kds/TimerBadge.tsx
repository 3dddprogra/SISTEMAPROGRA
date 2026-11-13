import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface Props {
  createdAt: string;
}

export const TimerBadge: React.FC<Props> = ({ createdAt }) => {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    const calculate = () => {
      const created = new Date(createdAt).getTime();
      const now = Date.now();
      const diffMs = Math.max(0, now - created);
      setElapsedMinutes(Math.floor(diffMs / 60000));
    };

    calculate();
    const interval = setInterval(calculate, 10000); // Actualiza cada 10s
    return () => clearInterval(interval);
  }, [createdAt]);

  // Color alerts: Verde < 10m, Ámbar 10-20m, Rojo > 20m
  let badgeStyle = 'bg-verde-100 text-verde-400 border-verde-300';
  let isAlert = false;

  if (elapsedMinutes >= 20) {
    badgeStyle = 'bg-kantuta-100 text-kantuta-400 border-kantuta-400 animate-pulse';
    isAlert = true;
  } else if (elapsedMinutes >= 10) {
    badgeStyle = 'bg-ocre-100 text-ocre-400 border-ocre-300';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border shadow-xs ${badgeStyle}`}
    >
      {isAlert ? <AlertTriangle className="w-3.5 h-3.5 text-kantuta-400" /> : <Clock className="w-3.5 h-3.5" />}
      <span>{elapsedMinutes} min</span>
    </span>
  );
};
