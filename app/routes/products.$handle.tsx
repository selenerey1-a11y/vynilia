import {useEffect, useMemo, useState} from 'react';
import type {CSSProperties} from 'react';
import {Link} from 'react-router';

type ProductVariantKey = 'Standard' | 'Pro';

type ProductData = {
  title: string;
  description: string[];
  tags: string[];
  images: string[];
  versions: ProductVariantKey[];
  artists: string[];
  price: Record<ProductVariantKey, number>;
  compareAt: number;
};

const productData: ProductData = {
  title: 'Vynilia',
  description: [
    '🎁 El detalle perfecto para esa persona especial',
    '🎵 Tu canción, sus fotos, su sonrisa',
    '📸 Con vuestras fotos y vuestra canción',
    '🎨 Personaliza tu música desde tu casa',
    '💝 El regalo que le dejará sin palabras',
  ],
  tags: ['Musica personalizada', 'Regalo original', 'Entrega rápida'],
  images: [
    'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=900&q=80',
  ],
  versions: ['Standard', 'Pro'],
  artists: ['Personaliza el tuyo', 'Maka', 'Bad Bunny', 'Quevedo', 'Anuel AA', 'Rosalía', 'Jay Wheeler'],
  price: {Standard: 49.97, Pro: 55.97},
  compareAt: 69.97,
};

function getTimeLeft() {
  const target = new Date();
  target.setHours(target.getHours() + 48);
  const diff = target.getTime() - Date.now();

  if (diff <= 0) {
    return {days: 0, hours: 0, minutes: 0, seconds: 0};
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function ProductPage() {
  const [selectedVersion, setSelectedVersion] = useState<ProductVariantKey>('Standard');
  const [selectedArtist, setSelectedArtist] = useState(productData.artists[0]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);
  const [added, setAdded] = useState(false);
  const [confetti, setConfetti] = useState<CSSTransform[]>([]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const price = useMemo(() => productData.price[selectedVersion], [selectedVersion]);

  const triggerConfetti = () => {
    const pieces = Array.from({length: 18}, (_, index) => ({
      left: `${Math.random() * 90 + 5}%`,
      delay: `${(index % 6) * 0.08}s`,
      duration: `${0.8 + Math.random() * 0.8}s`,
      background: ['#ff6b6b', '#ffd166', '#06d6a0', '#118ab2', '#f72585'][index % 5],
      transform: `translateY(0) rotate(${index * 18}deg)`,
    }));

    setConfetti(pieces);
    window.setTimeout(() => setConfetti([]), 1200);
  };

  const addToCart = () => {
    setAdded(true);
    triggerConfetti();
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="vynilia-page product-view">
      <div className="countdown-banner">
        <span>Oferta especial: termina en</span>
        <div className="countdown-container">
          {Object.entries(timeLeft).map(([key, value]) => (
            <div key={key} className="countdown-item">
              <span className="countdown-number">{String(value).padStart(2, '0')}</span>
              <span className="countdown-label">{key}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="product-layout">
        <div className="gallery-column">
          <div className="gallery-main">
            <img src={productData.images[selectedImage]} alt={productData.title} />
          </div>
          <div className="gallery-thumbnails">
            {productData.images.map((image, index) => (
              <button
                key={image}
                type="button"
                className={selectedImage === index ? 'thumbnail active' : 'thumbnail'}
                onClick={() => setSelectedImage(index)}
              >
                <img src={image} alt={`${productData.title} ${index + 1}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="product-info-panel">
          <span className="eyebrow accent">Regalo personalizado</span>
          <h1>{productData.title}</h1>

          <div className="rating-row">
            <div className="stars">★★★★★</div>
            <span>4.8/5 de más de 541 reseñas</span>
          </div>

          <div className="description-block">
            {productData.description.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          <ul className="mini-checks">
            {productData.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>

          <div className="option-group">
            <label>Versión</label>
            <div className="option-buttons">
              {productData.versions.map((version) => (
                <button
                  key={version}
                  type="button"
                  className={selectedVersion === version ? 'option-btn active' : 'option-btn'}
                  onClick={() => setSelectedVersion(version)}
                >
                  {version}
                </button>
              ))}
            </div>
          </div>

          <div className="option-group">
            <label>Artista</label>
            <div className="option-buttons artist-grid">
              {productData.artists.map((artist) => (
                <button
                  key={artist}
                  type="button"
                  className={selectedArtist === artist ? 'option-btn active' : 'option-btn'}
                  onClick={() => setSelectedArtist(artist)}
                >
                  {artist}
                </button>
              ))}
            </div>
          </div>

          <div className="price-block">
            <span className="price-current">€{price.toFixed(2)}</span>
            <span className="price-original">€{productData.compareAt.toFixed(2)}</span>
          </div>

          <div className="cta-row">
            <button type="button" className="primary-btn" onClick={addToCart}>
              {added ? 'Añadido al carrito' : 'Añadir al carrito'}
            </button>
            <Link to="/" className="secondary-btn">
              Volver a inicio
            </Link>
          </div>

          <div className="benefits-list">
            <div>✨ Envío gratis a todo el país</div>
            <div>🔄 Garantía de satisfacción 100%</div>
            <div>💳 Pago seguro</div>
          </div>
        </div>
      </div>

      <div className="confetti-layer" aria-hidden="true">
        {confetti.map((piece, index) => (
          <span
            key={`${piece.left}-${index}`}
            className="confetti-piece"
            style={piece as CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}
