/**
 * Converts Google Drive sharing links and direct image links into embeddable image URLs.
 */
export const formatDriveImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Google Drive link with /file/d/FILE_ID
  const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
  }

  // Google Drive link with id=FILE_ID or ?id=FILE_ID
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
  }

  // Google Drive open?id=FILE_ID
  const openIdMatch = trimmed.match(/open\?id=([a-zA-Z0-9_-]+)/);
  if (openIdMatch && openIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${openIdMatch[1]}`;
  }

  // Google Drive direct export view
  const ucMatch = trimmed.match(/\/uc\?.*id=([a-zA-Z0-9_-]+)/);
  if (ucMatch && ucMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${ucMatch[1]}`;
  }

  return trimmed;
};
