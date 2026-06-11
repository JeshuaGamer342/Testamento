import { Link } from 'react-router-dom'
import { notaryCards } from '../data/mockData'

function NotariesPage() {
  return (
    <section className="flow-page">
      <h1>Notarios disponibles</h1>
      <p className="lead">
        Directorio de notarios para validacion de testamentos digitales.
      </p>
      <article className="notice-box">
        Se recomienda primero a notarios con membresia activa y validacion
        completa de los dos formularios profesionales.
      </article>
      <div className="notary-grid">
        {notaryCards.map((notary) => (
          <article className="notary-card" key={notary.id}>
            <header>
              <span className="notary-avatar">N</span>
              <span className="status-badge">Activo</span>
            </header>
            <h3>{notary.name}</h3>
            <ul>
              <li>{notary.office}</li>
              <li>Cedula: {notary.id}</li>
              <li>{notary.city}</li>
              <li>{notary.mail}</li>
            </ul>
            <Link to="/mensajes" className="outline-button card-button">
              Mandar mensaje
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}

export default NotariesPage
