import {useEffect, useState} from 'react';

const OFFER_MINUTES = 45;

function useCountdown(totalMinutes: number) {
  const [secondsLeft, setSecondsLeft] = useState(totalMinutes * 60);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return {
    hours: Math.floor(secondsLeft / 3600),
    minutes: Math.floor((secondsLeft / 60) % 60),
    seconds: secondsLeft % 60,
  };
}

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * Site-wide promo strip: the offer countdown sits above the scrolling ticker,
 * and both sit above the header.
 */
export function PromoBar() {
  const {hours, minutes, seconds} = useCountdown(OFFER_MINUTES);

  return (
    <div className="promo-bar">
      <div className="promo-countdown">
        <span className="promo-countdown-title">⚠️ LA OFERTA TERMINA EN:</span>
        <span className="promo-clock">
          <span className="promo-unit">
            <span className="promo-num">{pad(hours)}</span>
            <span className="promo-lab">horas</span>
          </span>
          <span className="promo-sep">:</span>
          <span className="promo-unit">
            <span className="promo-num">{pad(minutes)}</span>
            <span className="promo-lab">min</span>
          </span>
          <span className="promo-sep">:</span>
          <span className="promo-unit">
            <span className="promo-num">{pad(seconds)}</span>
            <span className="promo-lab">seg</span>
          </span>
        </span>
      </div>

      <div className="announcement-bar">
        <div className="announcement-track">
          {Array.from({length: 4}).map((_, index) => (
            <span key={index}>
              🎁 ¡Regalos con tu Compra! 🎁 · Envío Express GRATIS con Vynilia
              Pro ·
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
