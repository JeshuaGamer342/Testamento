import { Outlet } from 'react-router-dom'
import SiteFooter from '../components/layout/SiteFooter'
import SiteHeader from '../components/layout/SiteHeader'

function PublicLayout() {
  return (
    <div className="public-shell">
      <SiteHeader />
      <main className="public-main animate-in">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}

export default PublicLayout
