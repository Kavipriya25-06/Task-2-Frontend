// src\pages\utils.js

export const validatePasswordStrength = (password) => {
  // Example: minimum 8 characters, 1 number, 1 uppercase
  const strongRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  return strongRegex.test(password);
};
