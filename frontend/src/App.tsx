import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Page, UserProfile } from "./types";
import { DEFAULT_USER_PROFILE, PURPOSE_OPTIONS, STYLE_OPTIONS } from "./constants/data";
import { BodyShapePage } from "../pages/BodyShapePage";
import { FaceShapePage } from "../pages/FaceShapePage";
import { LoginPage } from "../pages/LoginPage";
import { MainPage } from "../pages/MainPage";
import { PageAbout } from "../pages/PageAbout";
import { PersonalColorPage } from "../pages/PersonalColorPage";
import { SignupPage } from "../pages/SignupPage";
import { SkeletonPage } from "../pages/SkeletonPage";
import { fetchRecommendations } from "../services/recommendationService";

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

  // Calls are delegated to frontend/services so API logic stays out of UI code.
  const handleBackendSearch = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsLoading(true);
    setIsSearched(true);
    setAiGuidance("");

    try {
      const response = await fetchRecommendations({
        queryText,
        selectedColor,
        selectedSkeleton,
        selectedBody,
        userProfile,
      });

      if (response) {
        setBackendItems(response.real_products || []);
        const aiInfo = response.ai_analysis;
        const catalogNote = response.catalog_size
          ? `\n\n자체 상품 DB ${response.catalog_size}개를 기준으로 매칭했습니다.`
          : "";
        setAiGuidance(
          aiInfo?.reason
            ? `${buildExplainableGuidance(queryText)}\n\n${aiInfo.reason}${catalogNote}`
            : `${buildExplainableGuidance(queryText)}${catalogNote}`,
        );
      }
    } catch (error) {
      console.error("백엔드 서버 통신 에러:", error);
      setBackendItems([]);
      setAiGuidance(
        `${buildExplainableGuidance(queryText)}\n\n백엔드 연결을 확인해 주세요. 실행 명령: uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000`,
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

  if (currentPage === "login") {
    return <LoginPage onNavigate={handleNavigate} />;
  }

  if (currentPage === "signup") {
    return <SignupPage onNavigate={handleNavigate} />;
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
          <button onClick={() => setCurrentPage("login")} className="hover:text-black transition-colors duration-200">
            Login
          </button>
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

        {currentPage === "face-shape" && <FaceShapePage onNavigate={handleNavigate} />}
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
