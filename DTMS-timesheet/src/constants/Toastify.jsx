// src/utils/toast.js
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Success notification
export const showSuccessToast = (message) => {
  toast.success(message, {
    position: "top-center",
    autoClose: 1500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
    style: { backgroundColor: "white", color: "#82B97E" }, // Inline styles for red background
  });
};

// Error notification
export const showErrorToast = (message) => {
  toast.error(message, {
    position: "top-center",
    autoClose: 1500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
    style: { backgroundColor: "white", color: "#FF2400" },
  });
};

// Info notification
export const showInfoToast = (message) => {
  toast.info(message, {
    position: "top-center",
    autoClose: 1500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
    style: { backgroundColor: "white", color: "#5cadef" },
  });
};

// Warning notification
export const showWarningToast = (message) => {
  toast.warn(message, {
    position: "top-center",
    autoClose: 1500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
    style: { backgroundColor: "white", color: "#FCD12A" },
  });
};

// Toast container (to be added in your main App component)
export const ToastContainerComponent = () => <ToastContainer />;
