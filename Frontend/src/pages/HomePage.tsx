import { Link } from 'react-router-dom'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import { metricCards, processCards, securityPoints } from '../data/mockData'

function HomePage() {
  return (
    <>
      <Breadcrumbs />

      <section className="hero-section">
        <div className="hero-text">
          <p className="eyebrow">Plataforma notarial digital</p>
          <h1>Genera tu testamento de forma guiada y conecta con un notario</h1>
          <p className="lead">
            Resuelve tu borrador legal con un flujo de 5 pasos, descarga PDF y
            valida cada detalle por chat con notarios verificados.
          </p>
          <div className="hero-actions">
            <Link to="/mi-testamento" className="cta-button cta-large">
              Crear mi testamento
            </Link>
            <Link to="/notarios-disponibles" className="outline-button">
              Ver notarios disponibles
            </Link>
          </div>
        </div>
        <article className="hero-card">
          <div className="hero-image" aria-hidden="true" />
          <div className="hero-card-copy">
            <h3>Proceso seguro</h3>
            <p>Encripcion de grado bancario en cada paso.</p>
          </div>
        </article>
      </section>

      <section className="panel-section">
        <h2>Como funciona?</h2>
        <p className="section-lead">
          Un recorrido claro para completar tu testamento sin friccion.
        </p>
        <div className="card-grid card-grid-four">
          {processCards.map((item) => (
            <article key={item.title} className="info-card">
              <span className="card-icon">[]</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="security-section">
        <div className="security-copy">
          <p className="eyebrow">Premium service</p>
          <h2>Seguridad y rigor en cada paso de tu legado</h2>
          {securityPoints.map((point) => (
            <article key={point.title} className="security-point">
              <span className="point-icon">o</span>
              <div>
                <h3>{point.title}</h3>
                <p>{point.text}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="metric-grid">
          {metricCards.map((card) => (
            <article key={card.title} className="metric-card">
              <h3>{card.title}</h3>
              <p className="metric-subtitle">{card.subtitle}</p>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-panel">
        <h2>Protege tu legado hoy mismo</h2>
        <p>
          Toma decisiones importantes sin esperar al ultimo momento. Inicia tu
          borrador ahora y finaliza con tu notario de confianza.
        </p>
        <div className="cta-actions">
          <Link to="/mi-testamento" className="gold-button">
            Empezar proceso ahora
          </Link>
        </div>
      </section>

      <section className="legal-note">
        <strong>Aviso legal</strong>
        <p>
          El documento generado en la plataforma es un borrador base de apoyo.
          Para que el testamento tenga validez legal plena se requiere
          formalizacion presencial ante notario colegiado.
        </p>
      </section>
    </>
  )
}

export default HomePage