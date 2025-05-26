// src\constants\useAttachmentManager.js

import { useState } from "react";
import config from "../config";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "../constants/Toastify";

export const useAttachmentManager = (initialAttachments = []) => {
  const [attachments, setAttachments] = useState(initialAttachments);
  const [newAttachments, setNewAttachments] = useState(initialAttachments);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);

  const handleAttachmentChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    // Create a flat list of existing signatures (names + sizes)
    const existingSignatures = new Set([
      ...newAttachments.map((file) => `${file.name}_${file.size}`),
      ...attachments.map((file) => {
        const name = file.file
          .split("/")
          .pop()
          .replace(/_[a-zA-Z0-9]+\./, ".");
        return name; // For server-stored files
      }),
    ]);

    // Filter out duplicates
    const uniqueFiles = selectedFiles.filter((file) => {
      const signature = `${file.name}_${file.size}`;
      return (
        !existingSignatures.has(signature) && !existingSignatures.has(file.name)
      );
    });

    // Show warning once if there were duplicates
    if (uniqueFiles.length < selectedFiles.length) {
      showWarningToast("Some duplicate files were not added.");
    }

    // Add only the unique ones
    setNewAttachments((prevAttachments) => [
      ...prevAttachments,
      ...uniqueFiles,
    ]);

    e.target.value = "";
  };

  const removeExistingAttachment = (id) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  const removeNewAttachment = (index) => {
    setNewAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const getAttachmentName = (fileObj) => {
    if (fileObj.file) {
      return fileObj.file.split("/").pop().split("_").slice(1).join("_");
    }
    return fileObj.name || "Unnamed file";
  };

  const getAttachmentUrl = (fileObj) => {
    return fileObj.file ? config.apiBaseURL + fileObj.file : null;
  };

  return {
    attachments,
    setAttachments,
    newAttachments,
    setNewAttachments,
    handleAttachmentChange,
    removeExistingAttachment,
    removeNewAttachment,
    getAttachmentName,
    getAttachmentUrl,
    profilePicture,
    setProfilePicture,
    profilePictureUrl,
    setProfilePictureUrl,
  };
};
