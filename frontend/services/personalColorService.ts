import axios from "axios";
import { AISkinAnalysis, CameraFrameAnalysis } from "../src/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function analyzePersonalColorWithBackend(
  image: string,
  clientAnalysis: AISkinAnalysis,
  cameraFrame?: CameraFrameAnalysis | null,
): Promise<AISkinAnalysis> {
  const response = await axios.post(`${API_BASE_URL}/ai/personal-color`, {
    image,
    zones: clientAnalysis.zones,
    rgb: clientAnalysis.rgb,
    hsv: clientAnalysis.hsv,
    lab: clientAnalysis.lab,
    metrics: clientAnalysis.metrics,
    camera_frame: cameraFrame || undefined,
  });

  return response.data as AISkinAnalysis;
}
