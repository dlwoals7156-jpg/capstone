import axios from "axios";
import { authHeaders, getAccessToken } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

type AnalysisPayload = {
  result_name: string;
  confidence: number;
  season?: string;
  tone?: string;
};

async function saveAnalysis(path: string, payload: AnalysisPayload) {
  if (!getAccessToken()) return null;
  try {
    const response = await axios.post(`${API_BASE_URL}/analysis/${path}`, payload, {
      headers: authHeaders(),
    });
    return response.data;
  } catch (error) {
    console.warn(`${path} 분석 결과 저장 실패`, error);
    return null;
  }
}

export function savePersonalColorResult(payload: AnalysisPayload) {
  return saveAnalysis("personal-color", payload);
}

export function saveBodyTypeResult(payload: AnalysisPayload) {
  return saveAnalysis("body-type", payload);
}

export function saveSkeletonTypeResult(payload: AnalysisPayload) {
  return saveAnalysis("skeleton-type", payload);
}

export function saveBodyShapeResult(payload: AnalysisPayload) {
  return saveAnalysis("body-shape", payload);
}
