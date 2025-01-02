import axios from "axios";

const serverUrl = "http://localhost:9000";

const apiBase = axios.create({ baseURL: serverUrl });

export default apiBase;
