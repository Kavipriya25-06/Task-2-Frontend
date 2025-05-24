// src\utils\cleanFormData.js

export const cleanFormData = (formData, fieldsToNullify = []) => {
  const cleaned = { ...formData };

  fieldsToNullify.forEach((field) => {
    if (cleaned[field] === "") {
      cleaned[field] = null;
    }
  });

  return cleaned;
};
