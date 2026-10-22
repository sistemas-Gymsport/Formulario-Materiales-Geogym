import { Font, pdf } from '@react-pdf/renderer';
import unbounded700 from '@fontsource/unbounded/files/unbounded-latin-700-normal.woff?url';
import unbounded800 from '@fontsource/unbounded/files/unbounded-latin-800-normal.woff?url';
import manrope500 from '@fontsource/manrope/files/manrope-latin-500-normal.woff?url';
import manrope700 from '@fontsource/manrope/files/manrope-latin-700-normal.woff?url';
import manrope800 from '@fontsource/manrope/files/manrope-latin-800-normal.woff?url';
import { RequestReceipt } from './RequestReceipt.jsx';
import { receiptFilename } from './receiptName.js';

const absolute = (path) => new URL(path, globalThis.location.origin).href;

Font.register({
  family: 'Unbounded',
  fonts: [
    { src: absolute(unbounded700), fontWeight: 700 },
    { src: absolute(unbounded800), fontWeight: 800 }
  ]
});

Font.register({
  family: 'Manrope',
  fonts: [
    { src: absolute(manrope500), fontWeight: 500 },
    { src: absolute(manrope700), fontWeight: 700 },
    { src: absolute(manrope800), fontWeight: 800 }
  ]
});

Font.registerHyphenationCallback((word) => [word]);

export const createReceipt = async (request, timeZone) => {
  const document = <RequestReceipt request={request} timeZone={timeZone} logoUrl={absolute('/assets/logo-pdf.jpg')} generatedAt={new Date().toISOString()} />;
  const blob = await pdf(document).toBlob();
  return { blob, filename: receiptFilename(request) };
};
