import { memo } from 'react';
import { motion } from 'motion/react';
import { CheckDraw } from './Decor.jsx';

const Highlight = ({ text, query }) => {
  if (!query) return text;
  const index = text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .indexOf(query);
  if (index < 0) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  );
};

export const MaterialToken = memo(function MaterialToken({ material, selected, onToggle, query, caption, index = 0 }) {
  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={selected}
      className="token"
      onClick={() => onToggle(material.id)}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0, scale: selected ? [1, 1.035, 1] : 1 }}
      transition={{ opacity: { delay: Math.min(index * 0.022, 0.4), duration: 0.3 }, y: { delay: Math.min(index * 0.022, 0.4), duration: 0.35, ease: [0.22, 1, 0.36, 1] }, scale: { duration: 0.3 } }}
    >
      <span className="token__check" aria-hidden="true">
        <CheckDraw />
      </span>
      <span className="token__label">
        <Highlight text={material.name} query={query} />
        {caption && <small>{caption}</small>}
      </span>
    </motion.button>
  );
});
