import axios from "axios";
import { AuthUser, MyPageDashboard } from "../src/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const TOKEN_KEY = "deeplook_access_token";
const USER_KEY = "deeplook_user";

export async function signup(payload: { email: string; password: string; password_confirm: string; nickname: string; gender?: string }) {
  const response = await axios.post(`${API_BASE_URL}/auth/signup`, payload);
  return response.data;
}

export async function checkEmail(email: string): Promise<{ email: string; available: boolean }> {
  const response = await axios.get(`${API_BASE_URL}/auth/check-email`, { params: { email } });
  return response.data;
}

export async function login(payload: { email: string; password: string }): Promise<{ access_token: string; user: AuthUser }> {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, payload);
  if (response.data.access_token) {
    localStorage.setItem(TOKEN_KEY, response.data.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
  }
  return response.data;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await axios.get(`${API_BASE_URL}/users/me`, { headers: authHeaders() });
  localStorage.setItem(USER_KEY, JSON.stringify(response.data));
  return response.data;
}

export async function getMyPageDashboard(): Promise<MyPageDashboard> {
  const response = await axios.get(`${API_BASE_URL}/users/me/dashboard`, { headers: authHeaders() });
  return response.data;
}
