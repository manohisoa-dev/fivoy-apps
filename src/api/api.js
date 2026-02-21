import axios from "axios";

import NProgress from "nprogress";
import "nprogress/nprogress.css";

const api = axios.create({
  baseURL: "https://api.agnaro.io/api",
  //baseURL: "http://api.fivoy.loc/api",
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

api.interceptors.request.use(config => {
  NProgress.start();
  return config;
});

api.interceptors.response.use(
  response => {
    NProgress.done();
    return response;
  },
  error => {
    NProgress.done();
    return Promise.reject(error);
  }
);

export default api;