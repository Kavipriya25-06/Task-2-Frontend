// timesheet\src\config.js
import { isDev } from "./constants/devmode";

const devApiBaseURL = "http://127.0.0.1:8000/api";
// const prodApiBaseURL = "http://148.135.138.195:9000/api";

const devHomeURL = "503";
// const prodHomeURL = "http://148.135.138.195/";

const prodApiBaseURL = "http://dms.aero360.co.in:9000/api";
const prodHomeURL = "http://dms.aero360.co.in";

const config = {
  apiBaseURL: isDev ? devApiBaseURL : prodApiBaseURL,
  homeURL: isDev ? devHomeURL : prodHomeURL,
};

export default config;
