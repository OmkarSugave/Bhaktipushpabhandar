/* C:\Users\OMKAR\Documents\antigravity\bold-hypatia\js\api-config.js */

// Google Sheets & Cloudinary Configuration - Loaded from config.js
const apiConfig = {
  googleAppScriptUrl: typeof config !== 'undefined' ? config.googleAppScriptUrl : "",
  cloudinaryCloudName: typeof config !== 'undefined' ? config.cloudinaryCloudName : "",
  cloudinaryUploadPreset: typeof config !== 'undefined' ? config.cloudinaryUploadPreset : "" // MUST be an unsigned upload preset
};

// Decoupled configuration flags
let useGoogleSheets = false;
let useCloudinary = false;

if (apiConfig.googleAppScriptUrl && apiConfig.googleAppScriptUrl !== "YOUR_GOOGLE_SCRIPT_URL") {
  useGoogleSheets = true;
  console.log("📊 Google Sheets Database initialized successfully.");
} else {
  console.log("📦 Google Sheets running in LocalStorage fallback mode.");
}

if (apiConfig.cloudinaryCloudName && apiConfig.cloudinaryCloudName !== "YOUR_CLOUDINARY_CLOUD_NAME") {
  useCloudinary = true;
  console.log("☁️ Cloudinary Storage initialized successfully.");
} else {
  console.log("📦 Cloudinary running in LocalStorage base64 fallback mode.");
}

// --- Shared Cloudinary Upload Helper ---
function uploadToCloudinary(file, callback, errorCallback) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', apiConfig.cloudinaryUploadPreset);
  
  fetch(`https://api.cloudinary.com/v1_1/${apiConfig.cloudinaryCloudName}/upload`, {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.secure_url) {
      callback(data.secure_url);
    } else {
      console.error("Cloudinary upload failed:", data);
      if (errorCallback) errorCallback(data.error ? data.error.message : "Media upload failed");
    }
  })
  .catch(err => {
    console.error("Cloudinary error:", err);
    if (errorCallback) errorCallback(err);
  });
}

// --- Shared Google Sheets POST Call Helper ---
function callGoogleScript(payload, callback, errorCallback) {
  fetch(apiConfig.googleAppScriptUrl, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      if (errorCallback) errorCallback(data.error);
    } else {
      if (callback) callback(data);
    }
  })
  .catch(err => {
    console.error("API error:", err);
    if (errorCallback) errorCallback(err);
  });
}
