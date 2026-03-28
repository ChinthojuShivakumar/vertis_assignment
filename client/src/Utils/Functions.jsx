export const getPreview = (html, length = 120) => {
  const text = html.replace(/<[^>]+>/g, ""); // remove HTML tags
  return text.substring(0, length) + "...";
};
