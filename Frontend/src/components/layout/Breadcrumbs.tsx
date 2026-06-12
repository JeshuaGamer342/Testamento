import { Link, useLocation } from 'react-router-dom';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Si estamos en el home, no mostramos breadcrumbs
  if (pathnames.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol style={{ display: 'flex', listStyle: 'none', gap: '8px' }}>
        <li>
          <Link to="/">Inicio</Link>
        </li>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;

          return (
            <li key={to}>
              <span style={{ margin: '0 8px' }}>/</span>
              {last ? (
                <span className="breadcrumb-current" style={{ color: '#64748b' }}>
                  {value.replace(/-/g, ' ')}
                </span>
              ) : (
                <Link to={to}>{value.replace(/-/g, ' ')}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;