import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const TOKEN_KEY = "deeplook_access_token";

export async function signup(payload: { email: string; password: string; nickname: string; gender?: string }) {
  const response = await axios.post(`${API_BASE_URL}/auth/signup`, payload);
  return response.data;
}

export async function login(payload: { email: string; password: string }) {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, payload);
  if (response.data.access_token) {
    localStorage.setItem(TOKEN_KEY, response.data.access_token);
  }
  return response.data;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}
