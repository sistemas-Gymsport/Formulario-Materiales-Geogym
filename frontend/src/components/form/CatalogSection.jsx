import { useDeferredValue, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCheck, Plus, Search, SearchX, X } from 'lucide-react';
import { Button } from '../common/Button.jsx';
import { CategoryIcon } from '../common/CategoryIcon.jsx';
import { EmptyState } from '../common/Feedback.jsx';
import { CategoryNav } from './CategoryNav.jsx';
import { MaterialToken } from './MaterialToken.jsx';
import { normalizeKey, plural } from '../../utils/text.js';

const panelMotion = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
};

const CategoryPanel = ({ category, selection }) => {
  const selectedHere = category.materials.filter((m) => selection.selectedSet.has(m.id)).length;
  const allSelected = selectedHere === category.materials.length;
  const toggleAll = () => {
    category.materials.forEach((m) => {
      if (allSelected || !selection.selectedSet.has(m.id)) selection.toggle(m.id);
    });
  };
  return (
    <motion.div key={category.id} {...panelMotion}>
      <div className="panel__head">
        <div>
          <h3 className="panel__title">
            <span className="panel__title-icon" aria-hidden="true">
              <CategoryIcon name={category.icon} size={24} />
            </span>
            {category.name}
          </h3>
          <p className="panel__sub">
            {plural(category.materials.length, 'material disponible', 'materiales disponibles')} · {selectedHere} seleccionados
          </p>
        </div>
        <Button variant="ghost" size="sm" icon={allSelected ? X : CheckCheck} onClick={toggleAll}>
          {allSelected ? 'Quitar todos' : 'Seleccionar todos'}
        </Button>
      </div>
      <div className="tokens">
        {category.materials.map((material, index) => (
          <MaterialToken key={material.id} index={index} material={material} selected={selection.selectedSet.has(material.id)} onToggle={selection.toggle} />
        ))}
      </div>
    </motion.div>
  );
};

const SearchResults = ({ results, query, selection, onAddCustom, rawQuery }) => (
  <motion.div key="results" {...panelMotion}>
    <div className="panel__head">
      <div>
        <h3 className="panel__title">Resultados</h3>
        <p className="panel__sub" aria-live="polite">
          {plural(results.reduce((s, g) => s + g.materials.length, 0), 'coincidencia', 'coincidencias')} para «{rawQuery}»
        </p>
      </div>
    </div>
    {results.length ? (
      results.map((group) => (
        <div key={group.id} className="results-group">
          <p className="results-group__title">
            <CategoryIcon name={group.icon} size={15} />
            {group.name}
          </p>
          <div className="tokens">
            {group.materials.map((material, index) => (
              <MaterialToken key={material.id} index={index} material={material} query={query} caption={group.name} selected={selection.selectedSet.has(material.id)} onToggle={selection.toggle} />
            ))}
          </div>
        </div>
      ))
    ) : (
      <EmptyState icon={SearchX} title="No encontramos ese material" action={<Button variant="coral" icon={Plus} onClick={() => onAddCustom(rawQuery)}>Agregar «{rawQuery}» como material adicional</Button>}>
        Revisa la ortografía o agrégalo manualmente.
      </EmptyState>
    )}
  </motion.div>
);

export const CatalogSection = ({ categories, selection, onAddCustom }) => {
  const [activeId, setActiveId] = useState(categories[0]?.id);
  const [rawQuery, setRawQuery] = useState('');
  const deferred = useDeferredValue(rawQuery);
  const query = normalizeKey(deferred);

  const counts = useMemo(() => {
    const map = new Map();
    selection.ids.forEach((id) => {
      const entry = selection.catalogIndex.byId.get(id);
      if (entry) map.set(entry.categoryId, (map.get(entry.categoryId) ?? 0) + 1);
    });
    return map;
  }, [selection.ids, selection.catalogIndex]);

  const results = useMemo(() => {
    if (!query) return null;
    return categories.map((c) => ({ ...c, materials: c.materials.filter((m) => m.normalizedName.includes(query)) })).filter((c) => c.materials.length);
  }, [categories, query]);

  const active = categories.find((c) => c.id === activeId) ?? categories[0];

  const selectCategory = (id) => {
    setRawQuery('');
    setActiveId(id);
  };

  return (
    <>
      <div className="search" role="search">
        <Search size={20} className="search__icon" aria-hidden="true" />
        <input
          className="input"
          type="search"
          value={rawQuery}
          maxLength={80}
          onChange={(e) => setRawQuery(e.target.value)}
          placeholder="Buscar material: papel, cloro, plumas…"
          aria-label="Buscar materiales"
          enterKeyHint="search"
        />
        {rawQuery && (
          <button type="button" className="search__clear" onClick={() => setRawQuery('')} aria-label="Limpiar búsqueda">
            <X size={18} />
          </button>
        )}
      </div>
      <div className="catalog">
        <CategoryNav categories={categories} activeId={query ? null : active?.id} counts={counts} onSelect={selectCategory} />
        <div className="panel">
          <span className="panel__deco" aria-hidden="true" />
          <AnimatePresence mode="wait" initial={false}>
            {results ? (
              <SearchResults key="results" results={results} query={query} rawQuery={deferred.trim()} selection={selection} onAddCustom={onAddCustom} />
            ) : (
              active && <CategoryPanel key={active.id} category={active} selection={selection} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};
