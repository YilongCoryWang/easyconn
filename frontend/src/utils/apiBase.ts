import axios from "axios";

const serverUrl = "http://localhost:9000";
const apiSlug = "/api/v1";

const apiBase = axios.create({
  baseURL: serverUrl + apiSlug,
  withCredentials: true,
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});
export default apiBase;
