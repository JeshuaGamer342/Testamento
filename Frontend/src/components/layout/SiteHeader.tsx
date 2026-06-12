import { Link, NavLink } from 'react-router-dom'
import { topNavLinks } from '../../data/mockData'

function SiteHeader() {
  return (
    <header className="site-header">
      <Link to="/" className="brand" aria-label="Ir a inicio">
        TestaLink
      </Link>
      <nav className="site-nav" aria-label="Navegacion principal">
        {topNavLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `site-link${isActive ? ' site-link-active' : ''}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="site-actions">
      
        <Link to="/mi-testamento" className="cta-button">
          Crear mi testamento
        </Link>
      </div>
    </header>
  )
}

export default SiteHeader
