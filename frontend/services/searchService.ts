import axios from "axios";
import { SearchSuggestion } from "../src/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function fetchSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  const response = await axios.get(`${API_BASE_URL}/search/suggestions`, {
    params: { q: query, limit: 8 },
  });
  return response.data.suggestions || [];
}
