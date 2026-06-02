import axios from "axios";
import { UserProfile } from "../src/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export interface RecommendationRequestInput {
  queryText: string;
  selectedColor: string;
  selectedSkeleton: string;
  selectedBody: string;
  userProfile: UserProfile;
}

export async function fetchRecommendations(input: RecommendationRequestInput) {
  let rawSeason = "봄";
  if (input.selectedColor.includes("여름")) rawSeason = "여름";
  if (input.selectedColor.includes("가을")) rawSeason = "가을";
  if (input.selectedColor.includes("겨울")) rawSeason = "겨울";

  const response = await axios.post(`${API_BASE_URL}/recommendations`, {
    personal_color: rawSeason,
    personal_color_detail: input.selectedColor,
    user_prompt: input.queryText,
    skeleton_type: input.selectedSkeleton,
    body_shape: input.selectedBody,
    gender: input.userProfile.gender,
    height: input.userProfile.height ? Number(input.userProfile.height) : undefined,
    weight: input.userProfile.weight ? Number(input.userProfile.weight) : undefined,
    body_features: {
      shoulder_width: input.userProfile.shoulderWidth,
      waist_line: input.userProfile.waistLine,
      hip_width: input.userProfile.hipWidth,
      leg_ratio: input.userProfile.legRatio,
      upper_lower_ratio: input.userProfile.upperLowerRatio,
    },
    style_preferences: input.userProfile.stylePreferences,
    wearing_purposes: input.userProfile.wearingPurposes,
  });

  return response.data;
}
