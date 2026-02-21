// modules/products/productService.js

import api from "../../api/api";

export const fetchProducts = (params) => {
  return api.get("/products", { params });
};

export const createProduct = (data) => {
  return api.post("/products", data);
};

export const updateProduct = (id, data) => {
  return api.put(`/products/${id}`, data);
};

export const deleteProduct = (id) => {
  return api.delete(`/products/${id}`);
};