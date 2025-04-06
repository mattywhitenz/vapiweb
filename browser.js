// Import the Vapi module
const VapiModule = require('./dist/vapi');

// Check what's being exported and handle it appropriately
if (typeof VapiModule === 'object') {
  // If it's an object with a default export
  if (VapiModule.default) {
    window.Vapi = VapiModule.default;
  } 
  // If it exports a named Vapi class
  else if (VapiModule.Vapi) {
    window.Vapi = VapiModule.Vapi;
  }
  // Otherwise expose the entire module
  else {
    window.Vapi = VapiModule;
  }
} else {
  // If it's a function or class, expose directly
  window.Vapi = VapiModule;
} 