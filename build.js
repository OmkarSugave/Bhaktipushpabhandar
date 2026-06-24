const fs = require('fs');

const configData = {
  adminUsername: process.env.ADMIN_USERNAME,
  adminPassword: process.env.ADMIN_PASSWORD,
  googleAppScriptUrl: process.env.GOOGLE_SCRIPT_URL,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET
};

fs.writeFileSync('js/config.js', `const config = ${JSON.stringify(configData)};`);
console.log("Configuration config.js generated successfully.");
