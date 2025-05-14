import { useState } from "react";

export const useEmployeeFormHandler = (initialFormData) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({
    contact_number: "",
    personal_email: "",
    aadhaar_number: "",
    PAN: "",
    UAN: "",
    pf_number: "",
    esi_number: "",
    passport_number: "",
    employee_email: "",
    emergency_contact_number: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contact_number") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
      setErrors((prev) => ({
        ...prev,
        contact_number:
          numericValue.length > 0 && numericValue.length !== 10
            ? "Phone number must be exactly 10 digits."
            : "",
      }));
      return;
    }

    if (name === "personal_email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({
        ...prev,
        personal_email:
          value && !emailRegex.test(value) ? "Invalid email format." : "",
      }));
      return;
    }

    if (name === "aadhaar_number") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 12) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
      setErrors((prev) => ({
        ...prev,
        aadhaar_number:
          numericValue.length > 0 && numericValue.length !== 12
            ? "Aadhaar number must be exactly 12 digits."
            : "",
      }));
      return;
    }

    if (name === "PAN") {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
      setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
      setErrors((prev) => ({
        ...prev,
        PAN: value && !panRegex.test(value) ? "Invalid PAN format." : "",
      }));
      return;
    }

    if (name === "UAN") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 12) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
      setErrors((prev) => ({
        ...prev,
        UAN:
          numericValue.length > 0 && numericValue.length !== 12
            ? "UAN must be exactly 12 digits."
            : "",
      }));
      return;
    }

    if (name === "pf_number") {
      const pfRegex = /^[A-Za-z0-9]{5,22}$/;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({
        ...prev,
        pf_number:
          value && !pfRegex.test(value)
            ? "PF number must be 5-22 alphanumeric characters."
            : "",
      }));
      return;
    }

    if (name === "esi_number") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
      setErrors((prev) => ({
        ...prev,
        esi_number:
          numericValue.length > 0 && numericValue.length !== 10
            ? "ESI number must be exactly 10 digits."
            : "",
      }));
      return;
    }

    if (name === "passport_number") {
      const passportRegex = /^[A-Z]{1,2}[0-9]{6,7}$/i;
      setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
      setErrors((prev) => ({
        ...prev,
        passport_number:
          value && !passportRegex.test(value)
            ? "Invalid passport format (e.g., A1234567)."
            : "",
      }));
      return;
    }

    if (name === "employee_email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({
        ...prev,
        employee_email:
          value && !emailRegex.test(value)
            ? "Invalid official email format."
            : "",
      }));
      return;
    }

    if (name === "emergency_contact_number") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
      setErrors((prev) => ({
        ...prev,
        emergency_contact_number:
          numericValue.length > 0 && numericValue.length !== 10
            ? "Emergency contact number must be exactly 10 digits."
            : "",
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log("changed");
    console.log("form data", formData);
  };

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    handleChange,
  };
};
