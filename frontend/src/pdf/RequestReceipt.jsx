import { Document, Image, Page, Path, Svg, Text, View } from '@react-pdf/renderer';
import { PALETTE, s } from './receiptStyles.js';
import { formatDate, formatFullDate, formatTime12 } from '../utils/dates.js';
import { plural } from '../utils/text.js';

const BLOB = 'M421.5 76.3c58.8 33.4 108.6 92.9 117.3 158.5 8.8 65.6-23.6 137.3-71.1 189.6-47.5 52.2-110.2 85.1-176.6 92.2-66.4 7.1-136.5-11.6-178-58.2C71.6 412 58.7 337.6 67.4 271c8.6-66.6 38.9-125.4 85.4-162.8 46.6-37.4 109.3-53.4 165.6-50.3 56.3 3.2 44.3-15 103.1 18.4Z';

const Blob = ({ style, viewBox, color, opacity = 1 }) => (
  <Svg style={style} viewBox={viewBox} fixed>
    <Path d={BLOB} fill={color} fillOpacity={opacity} />
  </Svg>
);

const Check = ({ color = PALETTE.coral, ink = PALETTE.black }) => (
  <Svg style={s.check} viewBox="0 0 16 16">
    <Path d="M8 0.6c4.3 0 7.4 3.1 7.4 7.4S12.3 15.4 8 15.4 0.6 12.3 0.6 8 3.7 0.6 8 0.6Z" fill={color} />
    <Path d="M4.4 8.3 6.9 10.7 11.6 5.6" fill="none" stroke={ink} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const Plus = () => (
  <Svg style={s.check} viewBox="0 0 16 16">
    <Path d="M8 0.6c4.3 0 7.4 3.1 7.4 7.4S12.3 15.4 8 15.4 0.6 12.3 0.6 8 3.7 0.6 8 0.6Z" fill={PALETTE.coralInk} />
    <Path d="M8 4.6v6.8M4.6 8h6.8" stroke={PALETTE.white} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

const ShareIcon = () => (
  <Svg style={s.evidenceIcon} viewBox="0 0 34 34">
    <Path d="M17 1c9.4 0 16 6.6 16 16s-6.6 16-16 16S1 26.4 1 17 7.6 1 17 1Z" fill={PALETTE.coral} />
    <Path d="M17 9v11M12.5 13.5 17 9l4.5 4.5M10.5 19.5v3.5a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-3.5" fill="none" stroke={PALETTE.black} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const Info = ({ label, value, hint }) => (
  <View style={s.infoCell}>
    <View style={s.infoCard}>
      <Text style={s.infoLabel}>{label.toUpperCase()}</Text>
      <Text style={s.infoValue}>{value}</Text>
      {hint && <Text style={s.infoHint}>{hint}</Text>}
    </View>
  </View>
);

const CategoryBlock = ({ category }) => (
  <View style={s.category} wrap={category.materials.length > 16}>
    <View style={s.categoryHead} wrap={false}>
      <View style={s.categoryDot} />
      <Text style={s.categoryName}>{category.name}</Text>
      <Text style={s.categoryCount}>{plural(category.materials.length, 'material', 'materiales')}</Text>
    </View>
    <View style={s.items}>
      {category.materials.map((name) => (
        <View key={name} style={s.item} wrap={false}>
          <Check />
          <Text style={s.itemText}>{name}</Text>
        </View>
      ))}
    </View>
  </View>
);

export const RequestReceipt = ({ request, timeZone, logoUrl, generatedAt }) => {
  const date = formatFullDate(request.createdAt, timeZone);
  const time = formatTime12(request.createdAt, timeZone);
  return (
    <Document title={`Reporte de solicitud ${request.folio}`} author="GEO GYM" subject="Reporte de solicitud de material" creator="GEO GYM · Solicitud de materiales" language="es-MX">
      <Page size="A4" style={s.page}>
        <Blob style={s.decoTop} viewBox="0 171.4 385.7 428.6" color={PALETTE.coral} />
        <Blob style={s.decoBottom} viewBox="253.8 0 346.2 392.3" color={PALETTE.gray} opacity={0.06} />
        <View style={s.topbar} fixed>
          <View style={s.brand}>
            <Image src={logoUrl} style={s.brandMark} />
            <View>
              <Text style={s.brandWord}>GEO GYM</Text>
              <Text style={s.brandSub}>MATERIALES</Text>
            </View>
          </View>
          <Text style={s.topbarFolio}>{request.folio}</Text>
        </View>

        <View style={s.hero}>
          <View style={s.heroText}>
            <View style={s.kickerRow}>
              <View style={s.kickerBar} />
              <Text style={s.kicker}>COMPROBANTE DE REGISTRO</Text>
            </View>
            <Text style={s.title}>Reporte de solicitud</Text>
            <Text style={s.titleAccent}>para material</Text>
            <Svg style={s.swoosh} viewBox="0 0 300 30">
              <Path d="M4 22C70 6 170 2 296 14" fill="none" stroke={PALETTE.coral} strokeWidth={9} strokeLinecap="round" />
            </Svg>
            <Text style={s.heroLead}>Documento generado al confirmar la solicitud. Compártelo en el grupo de WhatsApp del gimnasio como evidencia.</Text>
          </View>
          <Image src={logoUrl} style={s.sticker} />
        </View>

        <View style={s.ticket} wrap={false}>
          <View>
            <Text style={s.ticketLabel}>FOLIO DE LA SOLICITUD</Text>
            <Text style={s.ticketFolio}>{request.folio}</Text>
          </View>
          <View style={s.status}>
            <Check color={PALETTE.black} ink={PALETTE.coral} />
            <Text style={s.statusText}>REGISTRADA</Text>
          </View>
        </View>

        <View style={s.infoGrid} wrap={false}>
          <Info label="Solicitante" value={request.requesterName} />
          <Info label="Sucursal" value={request.branchName} />
          <Info label="Fecha" value={formatDate(request.createdAt, timeZone)} hint={date.charAt(0).toUpperCase() + date.slice(1)} />
          <Info label="Hora" value={time} hint={timeZone === 'America/Mexico_City' ? 'Hora del centro de México' : `Zona horaria ${timeZone}`} />
        </View>

        <View style={s.summary} wrap={false}>
          <Text style={s.summaryNumber}>{request.itemCount}</Text>
          <View style={s.summaryText}>
            <Text style={s.summaryTitle}>{request.itemCount === 1 ? 'Material diferente solicitado' : 'Materiales diferentes solicitados'}</Text>
            <Text style={s.summaryHint}>Este reporte registra qué materiales se solicitan; no incluye cantidades.</Text>
            <View style={s.chips}>
              {request.categories.map((c) => (
                <Text key={c.name} style={s.chip}>
                  {c.name} · {c.materials.length}
                </Text>
              ))}
              {request.customMaterials.length > 0 && <Text style={s.chip}>Adicionales · {request.customMaterials.length}</Text>}
            </View>
          </View>
        </View>

        <View style={s.sectionHead} wrap={false} minPresenceAhead={80}>
          <Text style={s.sectionTitle}>Materiales solicitados</Text>
          <Text style={s.sectionNote}>{plural(request.categories.length, 'categoría', 'categorías')}</Text>
        </View>
        {request.categories.map((category) => (
          <CategoryBlock key={category.name} category={category} />
        ))}

        {request.customMaterials.length > 0 && (
          <View style={s.custom} wrap={false}>
            <View style={s.categoryHead}>
              <View style={[s.categoryDot, { backgroundColor: PALETTE.coralInk }]} />
              <Text style={s.customName}>Materiales adicionales</Text>
              <Text style={s.categoryCount}>{plural(request.customMaterials.length, 'material', 'materiales')}</Text>
            </View>
            <View style={s.items}>
              {request.customMaterials.map((name) => (
                <View key={name} style={s.item}>
                  <Plus />
                  <Text style={s.itemText}>{name}</Text>
                </View>
              ))}
            </View>
            <Text style={s.customHint}>Escritos por el solicitante; no forman parte del catálogo oficial.</Text>
          </View>
        )}

        <View style={s.evidence} wrap={false}>
          <ShareIcon />
          <View style={s.evidenceText}>
            <Text style={s.evidenceTitle}>Evidencia para el grupo de WhatsApp</Text>
            <Text style={s.evidenceBody}>
              Envía este PDF al grupo de WhatsApp del gimnasio para que tu solicitud quede registrada como evidencia. El folio {request.folio} identifica tu solicitud en el sistema.
            </Text>
            <Text style={s.evidenceMeta}>
              Registrada el {date} a las {time} · PDF generado el {formatDate(generatedAt, timeZone)} a las {formatTime12(generatedAt, timeZone)}
            </Text>
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>GEO GYM · Reporte de solicitud para material · {request.branchName}</Text>
          <Text style={s.footerPage} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};
