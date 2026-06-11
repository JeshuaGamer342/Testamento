import { Link } from 'react-router-dom'
import SiteFooter from '../components/layout/SiteFooter'
import {
  dashboardCaseFiles,
  dashboardInboxItems,
  dashboardSummaryCards,
} from '../data/mockData'

const proFooterLinks = [
  { label: 'Manual de notario', href: '#' },
  { label: 'Seguridad legal', href: '#' },
  { label: 'Soporte tecnico', href: '#' },
  { label: 'Membresia', href: '#' },
]

function NotaryDashboardPage() {
  return (
    <div className="dashboard-shell">
      <header className="dashboard-header dashboard-header-pro">
        <Link to="/" className="brand brand-pro" aria-label="Ir a inicio">
          <span>TestaLink</span>
          <small>PORTAL PROFESIONAL</small>
        </Link>
        <nav className="dashboard-nav" aria-label="Navegacion de notario">
          <a href="#" className="site-link site-link-active">
            Panel de Control
          </a>
        </nav>

        <div className="dashboard-meta">
          <button type="button" className="profile-chip">
            <strong>N Notaria Garcia</strong>
            <small>Ver perfil publico</small>
          </button>
        </div>
      </header>

      <main className="dashboard-main animate-in">
        <section className="dashboard-top">
          <div>
            <h1>Gestion notarial</h1>
            <p className="lead">
              Resumen de tramites legales y comunicaciones seguras para la
              Notaria Garcia.
            </p>
          </div>
        </section>

        <section className="dash-stats-grid dash-stats-grid-two">
          {dashboardSummaryCards.map((item) => (
            <article className="dash-stat" key={item.label}>
              <div className="dash-stat-top">
                <span className="dash-stat-icon" aria-hidden="true">
                  {item.icon}
                </span>
                {item.badge ? <small className="dash-stat-badge">{item.badge}</small> : null}
              </div>
              <p>{item.label}</p>
              <strong>{item.value}</strong>
            </article>
          ))}
        </section>

        <section className="dashboard-chat-grid dashboard-chat-grid-pro">
          <article className="dashboard-inbox dashboard-inbox-pro">
            <header className="inbox-title-row">
              <h2>Mensajes</h2>
              <button type="button" className="inbox-filter-button" aria-label="Filtrar">
                =
              </button>
            </header>
            <div className="inbox-thread">
              {dashboardInboxItems.map((item, index) => (
              <article
                key={item.id}
                className={`inbox-row${index === 0 ? ' inbox-row-active' : ''}`}
              >
                <div className="inbox-avatar" aria-hidden="true">
                  o
                </div>
                <div className="inbox-main">
                  <div className="inbox-line">
                    <strong>{item.name}</strong>
                    <small>{item.date}</small>
                  </div>
                  <p>{item.preview}</p>
                  <small className="inbox-exp">{item.expId}</small>
                </div>
              </article>
            ))}
            </div>
          </article>

          <article className="dashboard-chat-card">
            <header className="chat-header">
              <div className="chat-header-user">
                <span className="chat-user-avatar" aria-hidden="true">
                  o
                </span>
                <h2>Carlos Mendoza</h2>
              </div>
              <button type="button" className="gold-button">
                o Finalizar tramite y borrar chat
              </button>
            </header>
            <div className="chat-thread">
              <p className="chat-day-tag">Hoy, 4 de Octubre</p>
              <article className="bubble bubble-in">
                Estimado Dr. Garcia, envio adjunto el borrador final del
                testamento de mis padres para su revision antes de la firma.
                <span>10:42 AM</span>
              </article>
              <article className="bubble bubble-in file-bubble">
                <div className="pdf-row">
                  <div>
                    <strong>Borrador_Testamento_Mendoza.pdf</strong>
                    <p className="pdf-meta">1.2 MB - PDF</p>
                  </div>
                  <button type="button" className="download-icon-button" aria-label="Descargar PDF">
                    v
                  </button>
                </div>
                <span>10:43 AM</span>
              </article>
              <article className="bubble bubble-out">
                Recibido. Procedere con la revision de terminos legales y la
                verificacion de beneficiarios.
                <span>10:45 AM - Entregado</span>
              </article>
            </div>
            <footer className="chat-input-row">
              <button type="button" className="attach-button" aria-label="Adjuntar archivo">
                +
              </button>
              <input type="text" placeholder="Escribe un mensaje seguro" />
              <button type="button" className="circle-button" aria-label="Enviar mensaje">
                {'>'}
              </button>
            </footer>
          </article>
        </section>

        <section className="case-table-wrap">
          <h2>Expedientes en tramite</h2>
          <table className="case-table">
            <thead>
              <tr>
                <th>Cliente / expediente</th>
                <th>Tipo de tramite</th>
                <th>Estado legal</th>
                <th>Ultima actividad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {dashboardCaseFiles.map((file) => (
                <tr key={file.id}>
                  <td>
                    <strong>{file.id} - {file.name}</strong>
                    <span className="case-email">{file.email}</span>
                  </td>
                  <td>{file.process}</td>
                  <td>
                    <span className={`status-chip status-chip-${file.legalTone}`}>
                      {file.legalStatus}
                    </span>
                  </td>
                  <td>{file.lastUpdate}</td>
                  <td className="case-actions">...</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-meta-row">
            <p className="table-footnote">Mostrando 3 de 15 expedientes profesionales</p>
            <div className="table-pager" aria-label="Paginacion">
              <button type="button" className="pager-button" aria-label="Pagina anterior">
                {'<'}
              </button>
              <button type="button" className="pager-button" aria-label="Pagina siguiente">
                {'>'}
              </button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter
        className="dashboard-footer"
        brand="TestaLink PRO"
        copy="2024 TestaLink Profesional. Entorno seguro cifrado para gestion notarial colegiada conforme al RGPD."
        links={proFooterLinks}
      />
    </div>
  )
}

export default NotaryDashboardPage
