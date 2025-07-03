// src\constants\nextCode.js

const nextCode = (current = "") => {
  const A_CHAR_CODE = "A".charCodeAt(0);
  let carry = 1;
  let result = "";
  // Validation: if current is not all A-Z, reset to "A"
  if (!/^[A-Z]*$/.test(current)) {
    current = "";
  }

  for (let i = current.length - 1; i >= 0; i--) {
    let charCode = current.charCodeAt(i) - A_CHAR_CODE + carry;
    if (charCode >= 26) {
      charCode = 0;
      carry = 1;
    } else {
      carry = 0;
    }
    result = String.fromCharCode(charCode + A_CHAR_CODE) + result;
  }

  if (carry > 0) {
    result = "A" + result;
  }

  return result;
};

export default nextCode;
