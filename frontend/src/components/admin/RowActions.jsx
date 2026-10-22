import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil } from 'lucide-react';
import { StatusPill } from '../common/Feedback.jsx';

export const ActiveBadge = ({ active }) => <StatusPill tone={active ? 'open' : 'neutral'}>{active ? 'Activo' : 'Inactivo'}</StatusPill>;

export const RowActions = ({ label, isActive, onMove, onEdit, onToggle, first, last, busy }) => (
  <div className="row-actions">
    {onMove && (
      <>
        <button type="button" className="icon-btn" disabled={first || busy} onClick={() => onMove('up')} aria-label={`Subir ${label}`}>
          <ArrowUp size={17} />
        </button>
        <button type="button" className="icon-btn" disabled={last || busy} onClick={() => onMove('down')} aria-label={`Bajar ${label}`}>
          <ArrowDown size={17} />
        </button>
      </>
    )}
    <button type="button" className="icon-btn" onClick={onEdit} aria-label={`Editar ${label}`} disabled={busy}>
      <Pencil size={17} />
    </button>
    <button type="button" className="icon-btn" onClick={onToggle} disabled={busy} aria-label={isActive ? `Desactivar ${label}` : `Reactivar ${label}`} title={isActive ? 'Desactivar' : 'Reactivar'}>
      {isActive ? <EyeOff size={17} /> : <Eye size={17} />}
    </button>
  </div>
);
