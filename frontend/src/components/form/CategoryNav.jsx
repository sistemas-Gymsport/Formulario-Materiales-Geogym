import { motion } from 'motion/react';
import { CategoryIcon } from '../common/CategoryIcon.jsx';
import { AnimatedNumber } from '../common/Feedback.jsx';

export const CategoryNav = ({ categories, activeId, counts, onSelect }) => (
  <nav className="catnav" aria-label="Categorías de materiales">
    {categories.map((category) => {
      const active = category.id === activeId;
      const selected = counts.get(category.id) ?? 0;
      const total = category.materials.length;
      return (
        <button key={category.id} type="button" className="catnav__item" aria-current={active} onClick={() => onSelect(category.id)}>
          {active && <motion.span layoutId="catnav-active" className="catnav__active" transition={{ type: 'spring', stiffness: 400, damping: 36 }} />}
          <span className="catnav__icon">
            <CategoryIcon name={category.icon} size={20} />
          </span>
          <span className="catnav__text">
            <span className="catnav__name">{category.name}</span>
            <span className="catnav__meta">
              {selected} de {total} seleccionados
            </span>
          </span>
          {selected > 0 ? (
            <span className="catnav__count" aria-label={`${selected} seleccionados`}>
              <AnimatedNumber value={selected} />
            </span>
          ) : (
            <span />
          )}
          <span className="catnav__progress" aria-hidden="true">
            <span style={{ transform: `scaleX(${total ? selected / total : 0})` }} />
          </span>
        </button>
      );
    })}
  </nav>
);
