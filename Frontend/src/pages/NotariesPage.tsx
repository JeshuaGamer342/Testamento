import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { RecommendedNotary } from '../types'

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000'

type RecommendedNotariesResponse = {
  data?: RecommendedNotary[]
  message?: string
}

function NotariesPage() {
  const [notaries, setNotaries] = useState<RecommendedNotary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadNotaries() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/notaries/recommended`)
        const payload = (await response.json().catch(() => ({}))) as RecommendedNotariesResponse

        if (!response.ok) {
          if (!isMounted) {
            return
          }

          setErrorMessage(payload.message || 'No fue posible cargar los notarios recomendados.')
          return
        }

        if (isMounted) {
          setNotaries(Array.isArray(payload.data) ? payload.data : [])
        }
      } catch {
        if (isMounted) {
          setErrorMessage('No fue posible conectar con el directorio de notarios.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadNotaries()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="flow-page">
      <h1>Notarios recomendados</h1>
      <p className="lead">
        Directorio de notarios para validacion de testamentos digitales.
      </p>
      <article className="notice-box">
        Se recomienda primero a notarios con membresia activa y validacion
        completa de los dos formularios profesionales.
      </article>

      {isLoading ? <article className="notice-box">Cargando notarios...</article> : null}
      {!isLoading && errorMessage ? <article className="notice-box notice-box-error">{errorMessage}</article> : null}
      {!isLoading && !errorMessage && notaries.length === 0 ? (
        <article className="notice-box">No hay notarios registrados todavia.</article>
      ) : null}

      <div className="notary-grid">
        {notaries.map((notary) => (
          <article className="notary-card" key={notary.id}>
            <header>
              <span className="notary-avatar">N</span>
            </header>
            <h3>{notary.nombreOficial}</h3>
            <ul>
              <li>Notaria No. {notary.notariaNumero}</li>
              <li>Localidad: {notary.ubicacion}</li>
              <li>Email: {notary.contactoEmail}</li>
            </ul>
            <Link to="/mi-testamento" className="outline-button card-button">
              Iniciar testamento
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}

export default NotariesPage
