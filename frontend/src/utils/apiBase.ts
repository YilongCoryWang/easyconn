import axios from "axios";

const serverUrl = "http://localhost:9000";
const apiSlug = "/api/v1";

const useApiBase = () => {
  const option = {
    baseURL: serverUrl + apiSlug,
    withCredentials: true,
  };
  const token = localStorage.getItem("token");
  if (token) {
    Object.assign(option, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
  }
  return axios.create(option);
};
export default useApiBase;
