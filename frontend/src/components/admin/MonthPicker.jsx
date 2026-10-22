import { useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import { TextField } from '../common/Field.jsx';
import { MONTHS, currentYearMonth, monthKey } from '../../utils/dates.js';

export const monthOptions = (count = 24) => {
  const now = currentYearMonth();
  return Array.from({ length: count }, (_, i) => {
    const total = now.year * 12 + (now.month - 1) - i;
    const year = Math.floor(total / 12);
    const month = (total % 12) + 1;
    return { value: monthKey({ year, month }), label: `${MONTHS[month - 1]} ${year}`, year, month };
  });
};

export const MonthPicker = ({ value, onChange, allowAll, label = 'Mes' }) => {
  const options = useMemo(() => monthOptions(), []);
  return (
    <TextField as="select" label={label} icon={CalendarDays} value={value} onChange={(e) => onChange(e.target.value)}>
      {allowAll && <option value="">Todos los meses</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </TextField>
  );
};
