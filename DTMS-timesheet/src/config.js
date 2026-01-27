// timesheet\src\config.js
import { isDev } from "./constants/devmode";

const devApiBaseURL = "http://127.0.0.1:8000";
// const prodApiBaseURL = "http://148.135.138.195:9000/api";

const devHomeURL = "503";
// const prodHomeURL = "http://148.135.138.195/";

// const prodApiBaseURL = "https://dms.aero360.co.in:9000/api";

const prodApiBaseURL = "https://dms.aero360.co.in/api2";

// const prodApiBaseURL = "http://127.0.0.1:9000/api";
const prodHomeURL = "https://dms.aero360.co.in";

const config = {
  apiBaseURL: isDev ? devApiBaseURL : prodApiBaseURL,
  homeURL: isDev ? devHomeURL : prodHomeURL,
};

export default config;
