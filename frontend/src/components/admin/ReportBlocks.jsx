import { motion } from 'motion/react';
import { ClipboardList, Layers, PackagePlus, Sparkles, Store, Trophy, Users } from 'lucide-react';
import { StatCard } from './AdminUi.jsx';
import { plural } from '../../utils/text.js';

const leaderText = (leader) => (leader ? leader.names.join(' / ') : 'Sin datos');

export const SummaryStats = ({ summary }) => {
  const items = [
    { label: 'Solicitudes', value: summary.totalRequests, icon: ClipboardList, tone: 'accent', hint: 'registradas en el mes' },
    { label: 'Sucursales', value: `${summary.branchesWithRequests}/${summary.activeBranches}`, icon: Store, hint: 'con solicitudes' },
    { label: 'Solicitantes', value: summary.uniqueRequesters, icon: Users, hint: 'nombre + sucursal' },
    { label: 'Selecciones', value: summary.totalSelections, icon: Layers, hint: 'materiales marcados' },
    { label: 'Materiales diferentes', value: summary.distinctMaterials, icon: Sparkles, hint: 'incluye adicionales' },
    { label: 'Adicionales', value: summary.customSelections, icon: PackagePlus, hint: 'fuera del catálogo' },
    { label: 'Material más frecuente', value: leaderText(summary.topMaterial), icon: Trophy, tone: 'dark', hint: summary.topMaterial ? plural(summary.topMaterial.value, 'solicitud', 'solicitudes') : undefined },
    { label: 'Categoría líder', value: leaderText(summary.topCategory), icon: Layers, hint: summary.topCategory ? plural(summary.topCategory.value, 'selección', 'selecciones') : undefined },
    { label: 'Sucursal líder', value: leaderText(summary.topBranch), icon: Store, hint: summary.topBranch ? plural(summary.topBranch.value, 'solicitud', 'solicitudes') : undefined }
  ];
  return (
    <div className="grid grid--stats">
      {items.map((item, i) => (
        <StatCard key={item.label} index={i} {...item} />
      ))}
    </div>
  );
};

export const InsightList = ({ insights }) => (
  <ul className="insights">
    {insights.map((insight, i) => (
      <motion.li key={insight.text} className={`insight insight--${insight.tone}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.06 }}>
        <span className="insight__dot" aria-hidden="true" />
        {insight.text}
      </motion.li>
    ))}
  </ul>
);
