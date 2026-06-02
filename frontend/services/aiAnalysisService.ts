import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export type SkeletonAnalyzerResponse = {
  result_name: string;
  korean_name: string;
  skeleton_type: string;
  secondary_type: string;
  confidence: number;
  scores: Record<string, number>;
  evidence: string[];
  recommendation_points: string[];
};

export async function analyzeSkeletonType(payload: {
  survey_answers: string[];
  measurements?: Record<string, string | number | undefined>;
}): Promise<SkeletonAnalyzerResponse> {
  const response = await axios.post(`${API_BASE_URL}/ai/body-type`, payload);
  return response.data;
}
