export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), { href: url, download: filename, rel: 'noopener' });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};

export const toPdfFile = (blob, filename) => new File([blob], filename, { type: 'application/pdf' });

export const canShareFile = (file) => Boolean(file && navigator.canShare?.({ files: [file] }));

export const shareFile = async (file, { title, text }) => {
  try {
    await navigator.share({ files: [file], title, text });
    return 'shared';
  } catch (error) {
    return error?.name === 'AbortError' ? 'cancelled' : 'failed';
  }
};

export const safeFilePart = (value) =>
  String(value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
