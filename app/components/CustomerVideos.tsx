import {useEffect, useRef, useState} from 'react';

type CustomerVideo = {
  /**
   * File served from `public/videos/` (e.g. '/videos/cliente-1.mp4').
   * Leave it as `null` while the slot is still empty: the carousel renders a
   * placeholder in its place and the rest of the section keeps working.
   */
  src: string | null;
  /** Optional still frame shown before playback starts. */
  poster?: string;
  /** Short line under the video, e.g. the customer's first name. */
  caption?: string;
};

/**
 * The only thing to edit when a new customer video lands: drop the file in
 * `public/videos/` and fill in its `src` here. Add or remove entries freely —
 * the carousel adapts to however many there are.
 */
const CUSTOMER_VIDEOS: CustomerVideo[] = [
  {src: '/videos/cliente-1.mp4', poster: '/images/cliente-1.jpg'},
  {src: '/videos/cliente-6.mp4', poster: '/images/cliente-6.jpg'},
  {src: '/videos/cliente-2.mp4', poster: '/images/cliente-2.jpg'},
  {src: '/videos/cliente-7.mp4', poster: '/images/cliente-7.jpg'},
  {src: '/videos/cliente-3.mp4', poster: '/images/cliente-3.jpg'},
  {src: '/videos/cliente-8.mp4', poster: '/images/cliente-8.jpg'},
  {src: '/videos/cliente-4.mp4', poster: '/images/cliente-4.jpg'},
  {src: '/videos/cliente-5.mp4', poster: '/images/cliente-5.jpg'},
];

export function CustomerVideos({count = 1000}: {count?: number}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  /** Index of the slide playing with sound; everything else stays muted. */
  const [unmuted, setUnmuted] = useState<number | null>(null);
  /** Slots whose file failed to load, so a wrong path degrades to a placeholder. */
  const [broken, setBroken] = useState<Record<number, boolean>>({});

  // Only play what is on screen: keeps six vertical videos from all decoding at
  // once, and makes the carousel feel alive as the customer scrolls into it.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            void video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      {threshold: 0.4},
    );

    for (const video of videoRefs.current) {
      if (video) observer.observe(video);
    }
    return () => observer.disconnect();
  }, []);

  /**
   * Steps one card at a time. The target is a real snap position (measured off a
   * slide's own edge) — a plain `scrollBy` gets cancelled by
   * `scroll-snap-type: mandatory` when it lands between two snap points.
   */
  function scrollBySlide(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const slides = Array.from(
      track.querySelectorAll<HTMLElement>('.ugc-slide'),
    );
    if (slides.length === 0) return;

    const trackLeft = track.getBoundingClientRect().left;
    const offsets = slides.map(
      (slide) => slide.getBoundingClientRect().left - trackLeft,
    );
    // The slide currently sitting at the left edge of the viewport.
    let current = 0;
    offsets.forEach((offset, index) => {
      if (Math.abs(offset) < Math.abs(offsets[current])) current = index;
    });

    const next = Math.min(
      Math.max(current + direction, 0),
      slides.length - 1,
    );
    track.scrollTo({
      left: track.scrollLeft + offsets[next],
      behavior: 'smooth',
    });
  }

  function toggleSound(index: number) {
    setUnmuted((current) => (current === index ? null : index));
    const video = videoRefs.current[index];
    if (video) void video.play().catch(() => {});
  }

  return (
    <section className="ugc-section">
      <h2 className="ugc-title">
        + de {count} personas ya disfrutan de su Vynilia™
      </h2>

      <div className="ugc-carousel">
        <button
          type="button"
          className="ugc-arrow ugc-arrow-prev"
          aria-label="Ver vídeos anteriores"
          onClick={() => scrollBySlide(-1)}
        >
          ‹
        </button>

        <div className="ugc-track" ref={trackRef}>
          {CUSTOMER_VIDEOS.map((video, index) => (
            <div className="ugc-slide" key={index}>
              {video.src && !broken[index] ? (
                <>
                  <video
                    ref={(element) => {
                      videoRefs.current[index] = element;
                    }}
                    className="ugc-video"
                    src={video.src}
                    poster={video.poster}
                    muted={unmuted !== index}
                    loop
                    playsInline
                    preload="metadata"
                    onError={() => setBroken((c) => ({...c, [index]: true}))}
                  />
                  <button
                    type="button"
                    className="ugc-sound"
                    aria-label={
                      unmuted === index ? 'Silenciar vídeo' : 'Activar sonido'
                    }
                    onClick={() => toggleSound(index)}
                  >
                    {unmuted === index ? '🔊' : '🔇'}
                  </button>
                  {video.caption && (
                    <span className="ugc-caption">{video.caption}</span>
                  )}
                </>
              ) : (
                <div className="ugc-empty">
                  <span className="ugc-empty-icon">▶</span>
                  <span className="ugc-empty-label">Vídeo {index + 1}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          className="ugc-arrow ugc-arrow-next"
          aria-label="Ver más vídeos"
          onClick={() => scrollBySlide(1)}
        >
          ›
        </button>
      </div>
    </section>
  );
}
