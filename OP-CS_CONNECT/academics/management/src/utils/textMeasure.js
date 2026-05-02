export const measureTextWidth = async (text, font = '700 32px Inter') => {
  if (typeof document === 'undefined') return text.length * 16;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return text.length * 16;
  ctx.font = font;
  return Math.ceil(ctx.measureText(text).width);
};
