import { safeFilePart } from '../utils/files.js';

export const receiptFilename = (request) => `Solicitud-${request.folio}-${safeFilePart(request.branchName)}.pdf`;
