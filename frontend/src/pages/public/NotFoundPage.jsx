import { Link } from 'react-router-dom';
import { Logo } from '../../components/common/Logo.jsx';
import { OrganicBlob } from '../../components/form/Decor.jsx';

export default function NotFoundPage() {
  return (
    <div className="public">
      <div className="public__inner">
        <header className="topbar">
          <Logo />
        </header>
        <section className="state-screen">
          <OrganicBlob className="hero__blob" opacity={0.14} />
          <div className="state-screen__inner">
            <span className="kicker">Error 404</span>
            <h1>Esta página no existe</h1>
            <p>Revisa la dirección o vuelve al formulario de solicitudes.</p>
            <Link to="/solicitar" className="btn btn--coral">
              Ir al formulario
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
