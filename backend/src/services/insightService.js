export const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const list = (names) => (names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} y ${names.at(-1)}`);

const quoted = (names) => list(names.map((n) => `«${n}»`));

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

const percent = (part, total) => (total ? Math.round((part / total) * 100) : 0);

export const MIN_RELIABLE_REQUESTS = 3;

export const buildInsights = ({ summary, byBranch, byCategory, topCustom, year, month }) => {
  const insights = [];
  if (!summary.totalRequests) {
    return [{ tone: 'neutral', text: 'No se registraron solicitudes en este mes. No hay datos suficientes para generar conclusiones.' }];
  }
  const { topBranch, topMaterial, topCategory, peakDay } = summary;

  if (topBranch) {
    insights.push({
      tone: 'highlight',
      text: topBranch.tie
        ? `${list(topBranch.names)} empataron con el mayor número de solicitudes del mes (${plural(topBranch.value, 'solicitud', 'solicitudes')} cada una).`
        : `${topBranch.name} registró el mayor número de solicitudes del mes (${plural(topBranch.value, 'solicitud', 'solicitudes')}, ${percent(topBranch.value, summary.totalRequests)}% del total).`
    });
  }
  if (topMaterial) {
    insights.push({
      tone: 'highlight',
      text: topMaterial.tie
        ? `Los materiales seleccionados con mayor frecuencia fueron ${quoted(topMaterial.names)}, con ${plural(topMaterial.value, 'selección', 'selecciones')} cada uno.`
        : `${`«${topMaterial.name}»`} fue el material seleccionado con mayor frecuencia: aparece en ${plural(topMaterial.value, 'solicitud', 'solicitudes')}.`
    });
  }
  if (topCategory) {
    const catalogSelections = byCategory.reduce((s, c) => s + c.value, 0);
    insights.push({
      tone: 'highlight',
      text: topCategory.tie
        ? `Las categorías ${quoted(topCategory.names)} concentraron el mayor número de selecciones (${topCategory.value} cada una).`
        : `La categoría «${topCategory.name}» concentró el mayor número de selecciones (${topCategory.value}, ${percent(topCategory.value, catalogSelections)}% de las selecciones del catálogo).`
    });
  }
  const withoutRequests = byBranch.filter((b) => b.value === 0).map((b) => b.name);
  insights.push({
    tone: withoutRequests.length ? 'warning' : 'neutral',
    text: withoutRequests.length
      ? `${summary.branchesWithRequests} de ${summary.activeBranches} sucursales activas ${summary.branchesWithRequests === 1 ? 'realizó' : 'realizaron'} solicitudes. Sin solicitudes: ${list(withoutRequests)}.`
      : `Todas las sucursales activas (${summary.activeBranches}) realizaron al menos una solicitud.`
  });
  insights.push({
    tone: 'neutral',
    text: `En promedio, cada solicitud incluyó ${(summary.totalSelections / summary.totalRequests).toFixed(1)} materiales diferentes.`
  });
  if (peakDay && !peakDay.tie && summary.totalRequests >= MIN_RELIABLE_REQUESTS) {
    insights.push({ tone: 'neutral', text: `El ${peakDay.name} de ${MONTHS[month - 1]} de ${year} fue el día con más solicitudes (${peakDay.value}).` });
  }
  if (topCustom.length) {
    const top = topCustom[0];
    insights.push({
      tone: 'info',
      text: `Se ${summary.customSelections === 1 ? 'registró' : 'registraron'} ${plural(summary.customSelections, 'selección', 'selecciones')} de materiales adicionales fuera del catálogo${
        top.value > 1 ? `; el más frecuente fue «${top.name}» (${top.value} veces). Considera incorporarlo al catálogo.` : '.'
      }`
    });
  }
  if (summary.totalRequests < MIN_RELIABLE_REQUESTS) {
    insights.push({ tone: 'warning', text: `Con ${plural(summary.totalRequests, 'solicitud registrada', 'solicitudes registradas')}, las tendencias del mes no son concluyentes.` });
  }
  return insights;
};
