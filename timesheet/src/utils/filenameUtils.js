export const getCleanFilename = (filepath) => {
  if (!filepath) return "";
  const fullFilename = filepath.split("/").pop();
  const match = fullFilename.match(/^(.+?)_[a-zA-Z0-9]+\.(\w+)$/);
  return match ? `${match[1]}.${match[2]}` : fullFilename;
};
