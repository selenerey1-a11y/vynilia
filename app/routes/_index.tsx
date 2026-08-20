import {Link} from 'react-router';

const features = [
  '🎵 Tu canción personalizada',
  '📸 Con tus fotos y recuerdos',
  '🎨 Diseño premium y moderno',
  '🚚 Envío rápido a todo el país',
];

export default function HomePage() {
  return (
    <div className="vynilia-page">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">Vynilia</span>
          <h1>El regalo que deja sin palabras.</h1>
          <p>
            Personaliza tu canción con tus fotos, tus recuerdos y un diseño que
            convierte cada detalle en un momento inolvidable.
          </p>
          <div className="hero-actions">
            <Link to="/products/vynilia" className="primary-btn">
              Personaliza el tuyo
            </Link>
            <Link to="/products/vynilia" className="secondary-btn">
              Ver producto
            </Link>
          </div>
          <ul className="feature-list">
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>

        <div className="hero-visual">
          <div className="product-card">
            <div className="product-card-badge">Oferta limitada</div>
            <img
              src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80"
              alt="Vynilia product"
            />
            <div className="product-card-footer">
              <div>
                <span className="tiny-label">Desde</span>
                <strong>€49,97</strong>
              </div>
              <span className="old-price">€69,97</span>
            </div>
          </div>
        </div>
      </section>

      <section className="benefits-strip">
        <div>
          <strong>4.8/5</strong>
          <span>Valoración media</span>
        </div>
        <div>
          <strong>+5.000</strong>
          <span>Regalos personalizados</span>
        </div>
        <div>
          <strong>2-3 días</strong>
          <span>Entrega estimada</span>
        </div>
      </section>

      <section className="experience-section">
        <div className="section-header">
          <span className="eyebrow accent">Cómo funciona</span>
          <h2>Perfecto para ese detalle que no se olvida</h2>
        </div>

        <div className="steps-grid">
          <article>
            <span>01</span>
            <h3>Elige tu estilo</h3>
            <p>Selecciona versión, artista y estilo según tu idea.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Sube tus fotos</h3>
            <p>Hazlo desde tu móvil o tu ordenador en pocos segundos.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Disfruta del regalo</h3>
            <p>Recibe un recuerdo único pensado para sorprender.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
