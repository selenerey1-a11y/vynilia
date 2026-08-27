import {useEffect, useState} from 'react';

const RESERVE_SECONDS = 10 * 60;
const STORAGE_KEY = 'vynilia:cart-reserved-until';

/** Reads the stored deadline, starting a fresh one if there is none or it lapsed. */
function readDeadline() {
  try {
    const stored = Number(window.sessionStorage.getItem(STORAGE_KEY));
    if (stored && stored > Date.now()) return stored;
    const fresh = Date.now() + RESERVE_SECONDS * 1000;
    window.sessionStorage.setItem(STORAGE_KEY, String(fresh));
    return fresh;
  } catch {
    // Private windows and blocked site data throw on access; the countdown
    // still runs, it just restarts whenever the drawer is re-mounted.
    return Date.now() + RESERVE_SECONDS * 1000;
  }
}

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * "Carrito reservado durante MM:SS" in the cart drawer header. The deadline
 * lives in sessionStorage so browsing between pages continues the same
 * countdown instead of restarting it on every mount. The server always renders
 * the full 10:00 so hydration matches; the real deadline lands in an effect.
 */
export function CartReservation() {
  const [secondsLeft, setSecondsLeft] = useState(RESERVE_SECONDS);

  useEffect(() => {
    const deadline = readDeadline();
    const tick = () =>
      setSecondsLeft(Math.max(0, Math.round((deadline - Date.now()) / 1000)));

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span className="cart-reservation">
      Carrito reservado durante{' '}
      <strong>
        {pad(Math.floor(secondsLeft / 60))}:{pad(secondsLeft % 60)}
      </strong>
    </span>
  );
}
