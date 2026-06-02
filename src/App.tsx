import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import axios from "axios";
import { Page, UserProfile } from "./types";
import { DEFAULT_USER_PROFILE, PURPOSE_OPTIONS, STYLE_OPTIONS } from "./constants/data";
import { PageAbout } from "./components/pages/PageAbout";
import { MainPage } from "./components/pages/MainPage";
import { PersonalColorPage } from "./components/pages/PersonalColorPage";
import { SkeletonPage } from "./components/pages/SkeletonPage";
import { BodyShapePage } from "./components/pages/BodyShapePage";
import { LOCAL_PRODUCT_COUNT, searchLocalProducts } from "./utils/productCatalog";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("main");

  // ─── Profile states ───
  const [selectedColor, setSelectedColor] = useState<string>("봄 라이트");
  const [selectedSkeleton, setSelectedSkeleton] = useState<string>("스트레이트");
  const [selectedBody, setSelectedBody] = useState<string>("모래시계");
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);

  // ─── Recommendation states ───
  const [backendItems, setBackendItems] = useState<any[]>([]);
  const [aiGuidance, setAiGuidance] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);   // Loading spinner status
  const [isSearched, setIsSearched] = useState<boolean>(false); // Whether a search was executed

  const styleLabels = userProfile.stylePreferences
    .map((value) => STYLE_OPTIONS.find((item) => item.value === value)?.label)
    .filter(Boolean);
  const purposeLabels = userProfile.wearingPurposes
    .map((value) => PURPOSE_OPTIONS.find((item) => item.value === value)?.label)
    .filter(Boolean);

  const buildExplainableGuidance = (queryText: string) => {
    const genderLabel = userProfile.gender === "female" ? "여성" : "남성";
    const heightText = userProfile.height ? `${userProfile.height}cm` : "키 미입력";
    const weightText = userProfile.weight ? `${userProfile.weight}kg` : "몸무게 미입력";
    const styles = styleLabels.length ? styleLabels.join(", ") : "선호 스타일 미선택";
    const purposes = purposeLabels.length ? purposeLabels.join(", ") : "착용 목적 미선택";

    return [
      `"${queryText || "맞춤 아이템"}"에 가까운 상품을 ${Math.round(
        76 + Math.min(styleLabels.length + purposeLabels.length, 6) * 2,
      )}% 매칭도로 골랐어요.`,
      `함께 본 정보: ${genderLabel}, ${heightText}/${weightText}, ${selectedColor}, ${selectedSkeleton}, ${selectedBody}, ${styles}, ${purposes}.`,
      `잘 맞는 지점: 얼굴 가까이 오는 색은 퍼스널컬러를, 실루엣은 골격과 체형 보완을 우선해서 봤어요.`,
      `체크 포인트: 같은 색상명이라도 소재와 조명에 따라 인상이 달라질 수 있어요.`,
    ].join("\n");
  };

  const getLocalProductMatches = (queryText: string) =>
    searchLocalProducts(queryText, {
      selectedColor,
      selectedSkeleton,
      selectedBody,
      userProfile,
    });

  // ─── Backend Search (Axios) ───
  const handleBackendSearch = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsLoading(true);
    setIsSearched(true);
    setAiGuidance("");
    const localMatches = getLocalProductMatches(queryText);

    // Map to one of the 4 seasons expected by the backend ("봄", "여름", "가을", "겨울")
    let rawSeason = "봄";
    if (selectedColor.includes("여름")) rawSeason = "여름";
    if (selectedColor.includes("가을")) rawSeason = "가을";
    if (selectedColor.includes("겨울")) rawSeason = "겨울";

    try {
      const response = await axios.post("http://127.0.0.1:8000/recommend", {
        personal_color: rawSeason,
        personal_color_detail: selectedColor,
        user_prompt: queryText,
        skeleton_type: selectedSkeleton,
        body_shape: selectedBody,
        gender: userProfile.gender,
        height: userProfile.height ? Number(userProfile.height) : undefined,
        weight: userProfile.weight ? Number(userProfile.weight) : undefined,
        body_features: {
          shoulder_width: userProfile.shoulderWidth,
          waist_line: userProfile.waistLine,
          hip_width: userProfile.hipWidth,
          leg_ratio: userProfile.legRatio,
          upper_lower_ratio: userProfile.upperLowerRatio,
        },
        style_preferences: userProfile.stylePreferences,
        wearing_purposes: userProfile.wearingPurposes,
      });

      if (response.data) {
        const remoteItems = response.data.real_products || [];
        const shouldUseBrowserLocalDb = remoteItems.length === 0;

        setBackendItems(shouldUseBrowserLocalDb ? localMatches : remoteItems);

        const aiInfo = response.data.ai_analysis;
        const localNote = shouldUseBrowserLocalDb
          ? `\n\n로컬 모드: 백엔드 결과가 비어 있어 브라우저에 포함된 자체 상품 DB ${LOCAL_PRODUCT_COUNT}개에서 다시 골랐어요.`
          : "";

        if (aiInfo && aiInfo.reason) {
          setAiGuidance(`${buildExplainableGuidance(queryText)}\n\n${aiInfo.reason}${localNote}`);
        } else {
          setAiGuidance(`${buildExplainableGuidance(queryText)}${localNote}`);
        }
      }
    } catch (error) {
      console.error("백엔드 서버 통신 에러:", error);
      setBackendItems(localMatches);
      setAiGuidance(
        `${buildExplainableGuidance(queryText)}\n\n로컬 모드: 백엔드 연결 없이 브라우저 안의 자체 상품 DB ${LOCAL_PRODUCT_COUNT}개에서 바로 추천했어요.`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setIsSearched(false);
  };

  // ─── Render Page Router ───
  if (currentPage === "about") {
    return <PageAbout onBack={() => handleNavigate("main")} />;
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased selection:bg-black/5 selection:text-black">
      {/* Top Border Line */}
      <div className="h-1 bg-black w-full" />

      {/* Global Navigation Header */}
      <header className="max-w-7xl mx-auto px-5 sm:px-6 py-5 border-b border-black/5 flex items-center justify-between">
        <div
          className="flex items-baseline gap-3 cursor-pointer select-none group"
          onClick={() => handleNavigate("main")}
        >
          <span
            className="text-lg sm:text-xl font-light tracking-[0.18em] uppercase group-hover:text-black/60 transition-colors duration-200"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Deeplook
          </span>
          <span className="hidden sm:inline-flex text-[9px] tracking-[0.15em] uppercase text-black/35 border border-black/10 rounded-md px-2 py-0.5">
            AI Fashion Tech Lab
          </span>
        </div>
        <nav className="flex items-center gap-5 sm:gap-8 text-[11px] tracking-[0.15em] uppercase text-black/50">
          <button onClick={() => setCurrentPage("about")} className="hover:text-black transition-colors duration-200">
            About
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-black transition-colors duration-200 flex items-center gap-0.5"
          >
            Lab <ArrowUpRight size={10} />
          </a>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-6 py-8 sm:py-12">
        {currentPage === "main" && (
          <MainPage
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            selectedSkeleton={selectedSkeleton}
            setSelectedSkeleton={setSelectedSkeleton}
            selectedBody={selectedBody}
            setSelectedBody={setSelectedBody}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            onNavigate={handleNavigate}
            handleBackendSearch={handleBackendSearch}
            backendItems={backendItems}
            aiGuidance={aiGuidance}
            isLoading={isLoading}
            isSearched={isSearched}
            setIsSearched={setIsSearched}
          />
        )}

        {currentPage === "personal-color" && (
          <PersonalColorPage
            onComplete={(color) => setSelectedColor(color)}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === "skeleton" && (
          <SkeletonPage
            onComplete={(skeleton) => setSelectedSkeleton(skeleton)}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === "body-shape" && (
          <BodyShapePage
            onComplete={(body) => setSelectedBody(body)}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Global Minimalist Footer */}
      <footer className="max-w-7xl mx-auto px-5 sm:px-6 mt-14 pt-6 pb-10 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-[10px] tracking-wide text-black/20">
          © 2026 AI Fashion Tech Lab / Deeplook Platform Project
        </span>
        <span className="flex items-center gap-2 text-[10px] text-black/25">
          <span className="w-1.5 h-1.5 rounded-full bg-black/40 animate-pulse" />
          Local DB recommendation ready
        </span>
      </footer>
    </div>
  );
}
