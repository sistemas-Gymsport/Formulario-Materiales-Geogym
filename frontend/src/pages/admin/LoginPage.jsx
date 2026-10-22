import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { KeyRound, LogIn, UserRound } from 'lucide-react';
import { BrandImage, Logo } from '../../components/common/Logo.jsx';
import { Button } from '../../components/common/Button.jsx';
import { TextField } from '../../components/common/Field.jsx';
import { OrganicBlob } from '../../components/form/Decor.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import '../../styles/admin.css';

export default function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (status === 'authenticated') return <Navigate to={location.state?.from ?? '/admin'} replace />;

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!values.username.trim()) next.username = 'Escribe tu nombre de usuario';
    if (!values.password) next.password = 'Escribe tu contraseña';
    if (Object.keys(next).length) return setErrors(next);
    setBusy(true);
    setErrors({});
    try {
      await login({ username: values.username.trim().toLowerCase(), password: values.password });
      navigate(location.state?.from ?? '/admin', { replace: true });
    } catch (error) {
      setErrors({ form: error.message });
      setValues((v) => ({ ...v, password: '' }));
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  return (
    <div className="login">
      <section className="login__art">
        <Logo light subtitle="Panel administrativo" />
        <OrganicBlob className="login__blob" color="#393939" />
        <motion.div className="login__badge" initial={{ opacity: 0, y: 30, rotate: 4 }} animate={{ opacity: 1, y: 0, rotate: -4 }} transition={{ type: 'spring', stiffness: 140, damping: 16, delay: 0.15 }}>
          <BrandImage className="brand-sticker" large />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          Control
          <br />
          de <em>materiales</em>
        </motion.h1>
      </section>
      <section className="login__panel">
        <motion.form className="login__form" onSubmit={submit} noValidate initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <span className="kicker">Acceso restringido</span>
          <h2>Iniciar sesión</h2>
          {location.state?.expired && <div className="alert alert--info">Tu sesión expiró. Vuelve a iniciar sesión.</div>}
          <TextField label="Nombre de usuario" icon={UserRound} value={values.username} onChange={set('username')} autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={40} error={errors.username} />
          <TextField label="Contraseña" icon={KeyRound} type="password" value={values.password} onChange={set('password')} autoComplete="current-password" maxLength={128} error={errors.password} />
          {errors.form && (
            <div className="alert" role="alert">
              {errors.form}
            </div>
          )}
          <Button type="submit" variant="coral" icon={LogIn} loading={busy} block>
            {busy ? 'Verificando…' : 'Entrar al panel'}
          </Button>
        </motion.form>
      </section>
    </div>
  );
}
