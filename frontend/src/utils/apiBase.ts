import axios from "axios";

const serverUrl = "http://localhost:9000";

const apiBase = axios.create({
  baseURL: serverUrl,
  withCredentials: true,
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});
export default apiBase;
