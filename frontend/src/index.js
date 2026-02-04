import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

console.log('🚀 INDEX.JS: Starting React app initialization');
console.log('🚀 INDEX.JS: Current URL:', window.location.href);
console.log('🚀 INDEX.JS: Environment:', process.env.NODE_ENV);
console.log('🚀 INDEX.JS: Backend URL:', process.env.REACT_APP_BACKEND_URL);

const root = ReactDOM.createRoot(document.getElementById("root"));
console.log('🚀 INDEX.JS: Root element found, rendering App');

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

console.log('🚀 INDEX.JS: App rendered successfully');
