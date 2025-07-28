// timesheet\src\config.js
import { isDev } from "./constants/devmode";

const devApiBaseURL = "http://127.0.0.1:8000/api";
const prodApiBaseURL = "http://192.168.0.209:8000/api";

const config = {
  apiBaseURL: isDev ? devApiBaseURL : prodApiBaseURL,
};

export default config;
