// src\constants\useAttachmentManager.js

import { useState } from "react";
import config from "../config";

export const useAttachmentManager = (initialAttachments = []) => {
  const [attachments, setAttachments] = useState(initialAttachments);
  const [newAttachments, setNewAttachments] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null); 
  const[profilePictureUrl,setProfilePictureUrl] =useState(null);

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    setNewAttachments((prev) => [...prev, ...files]);
    e.target.value = ""; // Allow re-selecting same files
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
    handleAttachmentChange,
    removeExistingAttachment,
    removeNewAttachment,
    getAttachmentName,
    getAttachmentUrl,
    profilePicture,
    setProfilePicture,
    profilePictureUrl,
    setProfilePictureUrl ,
  };
};
