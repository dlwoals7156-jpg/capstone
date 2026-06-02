import axios from "axios";
import { CameraQualitySnapshot, RecommendationProduct, UserProfile } from "../src/types";
import { authHeaders } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export interface RecommendationRequestInput {
  queryText: string;
  selectedColor: string;
  selectedSkeleton: string;
  selectedBody: string;
  userProfile: UserProfile;
  cameraQuality?: CameraQualitySnapshot;
}

export interface RecommendationResponse {
  ai_analysis?: {
    reason?: string;
    match_confidence?: number;
    search_relevance?: number;
    search_mode?: string;
    external_search_keywords?: string[];
  };
  real_products?: RecommendationProduct[];
  catalog_size?: number;
}

export async function fetchRecommendations(input: RecommendationRequestInput): Promise<RecommendationResponse> {
  let rawSeason = "봄";
  if (input.selectedColor.includes("여름")) rawSeason = "여름";
  if (input.selectedColor.includes("가을")) rawSeason = "가을";
  if (input.selectedColor.includes("겨울")) rawSeason = "겨울";

  const response = await axios.post(
    `${API_BASE_URL}/recommendations`,
    {
      personal_color: rawSeason,
      personal_color_detail: input.selectedColor,
      user_prompt: input.queryText,
      skeleton_type: input.selectedSkeleton,
      body_shape: input.selectedBody,
      gender: input.userProfile.gender,
      height: input.userProfile.height ? Number(input.userProfile.height) : undefined,
      weight: input.userProfile.weight ? Number(input.userProfile.weight) : undefined,
      style_preferences: input.userProfile.stylePreferences,
      camera_quality: input.cameraQuality || {},
    },
    { headers: authHeaders() },
  );

  return response.data;
}
