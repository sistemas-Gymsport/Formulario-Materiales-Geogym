import { useCallback, useMemo, useReducer } from 'react';
import { normalizeKey, toTitleSentence } from '../utils/text.js';

const initial = { ids: [], custom: [] };

const reducer = (state, action) => {
  switch (action.type) {
    case 'toggle':
      return state.ids.includes(action.id) ? { ...state, ids: state.ids.filter((id) => id !== action.id) } : { ...state, ids: [...state.ids, action.id] };
    case 'addCustom':
      if (state.custom.some((c) => c.key === action.item.key)) return state;
      return { ...state, custom: [...state.custom, action.item] };
    case 'removeCustom':
      return { ...state, custom: state.custom.filter((c) => c.key !== action.key) };
    case 'prune':
      return { ...state, ids: state.ids.filter((id) => action.valid.has(id)) };
    case 'reset':
      return initial;
    default:
      return state;
  }
};

export const useMaterialSelection = (categories) => {
  const [state, dispatch] = useReducer(reducer, initial);

  const catalogIndex = useMemo(() => {
    const byId = new Map();
    const byKey = new Map();
    for (const category of categories ?? []) {
      for (const material of category.materials) {
        const entry = { ...material, categoryId: category.id, categoryName: category.name };
        byId.set(material.id, entry);
        byKey.set(material.normalizedName, entry);
      }
    }
    return { byId, byKey };
  }, [categories]);

  const selectedSet = useMemo(() => new Set(state.ids), [state.ids]);

  const checkCustom = useCallback(
    (name) => {
      const key = normalizeKey(name);
      const catalogMatch = catalogIndex.byKey.get(key);
      if (catalogMatch) return { error: `«${catalogMatch.name}» ya existe en ${catalogMatch.categoryName}.`, match: catalogMatch };
      if (state.custom.some((c) => c.key === key)) return { error: 'Ya agregaste este material.' };
      return { key };
    },
    [catalogIndex, state.custom]
  );

  const addCustom = useCallback(
    (name) => {
      const result = checkCustom(name);
      if (result.error) return result;
      const item = { key: result.key, name: toTitleSentence(name) };
      dispatch({ type: 'addCustom', item });
      return { item };
    },
    [checkCustom]
  );

  const grouped = useMemo(
    () =>
      (categories ?? [])
        .map((c) => ({ id: c.id, name: c.name, icon: c.icon, materials: c.materials.filter((m) => selectedSet.has(m.id)) }))
        .filter((g) => g.materials.length),
    [categories, selectedSet]
  );

  return {
    ids: state.ids,
    custom: state.custom,
    selectedSet,
    total: state.ids.length + state.custom.length,
    grouped,
    catalogIndex,
    toggle: useCallback((id) => dispatch({ type: 'toggle', id }), []),
    removeCustom: useCallback((key) => dispatch({ type: 'removeCustom', key }), []),
    prune: useCallback((valid) => dispatch({ type: 'prune', valid }), []),
    reset: useCallback(() => dispatch({ type: 'reset' }), []),
    addCustom,
    checkCustom
  };
};
