import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { AISkinAnalysis, AuthUser, BodyShapeResult, CameraQualitySnapshot, Page, RecommendationProduct, SkeletonResult, UserProfile } from "./types";
import { DEFAULT_USER_PROFILE, STYLE_OPTIONS } from "./constants/data";
import { BodyShapePage } from "../pages/BodyShapePage";
import { LoginPage } from "../pages/LoginPage";
import { MainPage } from "../pages/MainPage";
import { MyPage } from "../pages/MyPage";
import { PageAbout } from "../pages/PageAbout";
import { PersonalColorPage } from "../pages/PersonalColorPage";
import { SignupPage } from "../pages/SignupPage";
import { SkeletonPage } from "../pages/SkeletonPage";
import { saveBodyShapeResult, savePersonalColorResult, saveSkeletonTypeResult } from "../services/analysisService";
import { getAccessToken, getCurrentUser, getStoredUser, logout } from "../services/authService";
import { fetchRecommendations, saveRecommendationResult } from "../services/recommendationService";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("main");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredUser());

  // ─── Profile states ───
  const [selectedColor, setSelectedColor] = useState<string>("봄 라이트");
  const [selectedSkeleton, setSelectedSkeleton] = useState<string>("스트레이트");
  const [selectedBody, setSelectedBody] = useState<string>("모래시계");
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [cameraQuality, setCameraQuality] = useState<CameraQualitySnapshot>({});

  // ─── Recommendation states ───
  const [backendItems, setBackendItems] = useState<RecommendationProduct[]>([]);
  const [aiGuidance, setAiGuidance] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);   // Loading spinner status
  const [isSearched, setIsSearched] = useState<boolean>(false); // Whether a search was executed
  const [isSavingRecommendation, setIsSavingRecommendation] = useState<boolean>(false);
  const [savedRecommendationId, setSavedRecommendationId] = useState<number | null>(null);
  const [saveMessage, setSaveMessage] = useState<string>("");

  const styleLabels = userProfile.stylePreferences
    .map((value) => STYLE_OPTIONS.find((item) => item.value === value)?.label)
    .filter(Boolean);

  useEffect(() => {
    if (!getAccessToken()) return;
    void getCurrentUser()
      .then((user) => setCurrentUser(user))
      .catch(() => {
        logout();
        setCurrentUser(null);
      });
  }, []);

  const buildExplainableGuidance = (queryText: string) => {
    const genderLabel = userProfile.gender === "female" ? "여성" : "남성";
    const heightText = userProfile.height ? `${userProfile.height}cm` : "키 미입력";
    const weightText = userProfile.weight ? `${userProfile.weight}kg` : "몸무게 미입력";
    const styles = styleLabels.length ? styleLabels.join(", ") : "선호 스타일 미선택";

    return [
      `"${queryText || "맞춤 아이템"}" 요청을 자체 상품 DB와 백엔드 추천 점수로 매칭했어요.`,
      `함께 본 정보: ${genderLabel}, ${heightText}/${weightText}, ${selectedColor}, ${selectedSkeleton}, ${selectedBody}, ${styles}.`,
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
    setSavedRecommendationId(null);
    setSaveMessage("");

    try {
      const response = await fetchRecommendations({
        queryText,
        selectedColor,
        selectedSkeleton,
        selectedBody,
        userProfile,
        cameraQuality,
      });

      if (response) {
        setBackendItems(response.real_products || []);
        const aiInfo = response.ai_analysis;
        const catalogNote = response.catalog_size
          ? `\n\n자체 상품 DB ${response.catalog_size}개를 기준으로 매칭했습니다.`
          : "";
        const confidenceNote =
          typeof aiInfo?.match_confidence === "number"
            ? `\n백엔드 추천 신뢰도: ${aiInfo.match_confidence}%`
            : "";
        setAiGuidance(
          aiInfo?.reason
            ? `${buildExplainableGuidance(queryText)}${confidenceNote}\n\n${aiInfo.reason}${catalogNote}`
            : `${buildExplainableGuidance(queryText)}${confidenceNote}${catalogNote}`,
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

  const handleSaveRecommendation = async () => {
    if (!currentUser) {
      setSaveMessage("로그인 후 추천 목록을 저장할 수 있습니다.");
      setCurrentPage("login");
      return;
    }
    if (backendItems.length === 0) {
      setSaveMessage("저장할 추천 결과가 없습니다.");
      return;
    }
    if (savedRecommendationId) {
      setSaveMessage("이미 저장된 추천 목록입니다.");
      return;
    }

    setIsSavingRecommendation(true);
    setSaveMessage("");
    try {
      const saved = await saveRecommendationResult({
        recommendedItems: backendItems,
        recommendedStyle: aiGuidance || "DeepLook 추천 결과",
      });
      setSavedRecommendationId(saved.id);
      setSaveMessage("마이페이지에 추천 목록을 저장했습니다.");
    } catch (error) {
      console.error("추천 목록 저장 실패:", error);
      setSaveMessage("추천 목록 저장에 실패했습니다. 로그인 상태를 확인해 주세요.");
    } finally {
      setIsSavingRecommendation(false);
    }
  };

  const handleNavigate = (page: Page) => {
    if (page === "mypage" && !currentUser) {
      setCurrentPage("login");
      setIsSearched(false);
      return;
    }
    setCurrentPage(page);
    setIsSearched(false);
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    handleNavigate("main");
  };

  const splitPersonalColorLabel = (color: string) => {
    const [season = color, tone = ""] = color.split(/\s+/);
    return { season, tone };
  };

  const handlePersonalColorComplete = (color: string, analysis?: AISkinAnalysis) => {
    const fallback = splitPersonalColorLabel(color);
    setSelectedColor(color);
    if (analysis) {
      setCameraQuality({
        confidence: analysis.confidence,
        qualityLabel: analysis.qualityLabel,
        warnings: analysis.warnings,
        metrics: analysis.metrics,
        cameraFrame: analysis.cameraFrame,
      });
    }
    void savePersonalColorResult({
      result_name: color,
      season: analysis?.result.season || fallback.season,
      tone: analysis?.detailTone || fallback.tone,
      confidence: analysis?.confidence || 0.74,
    });
  };

  const handleSkeletonComplete = (skeleton: string, result?: SkeletonResult) => {
    setSelectedSkeleton(skeleton);
    void saveSkeletonTypeResult({
      result_name: skeleton,
      confidence: result?.confidence || 0.72,
    });
  };

  const handleBodyComplete = (body: string, result?: BodyShapeResult) => {
    setSelectedBody(body);
    void saveBodyShapeResult({
      result_name: body,
      confidence: result?.confidence || 0.72,
    });
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
        <nav className="flex items-center gap-4 sm:gap-8 text-[11px] tracking-[0.15em] uppercase text-black/50">
          {currentUser ? (
            <>
              <button onClick={() => handleNavigate("mypage")} className="hover:text-black transition-colors duration-200">
                My Page
              </button>
              <button onClick={handleLogout} className="hover:text-black transition-colors duration-200">
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => handleNavigate("login")} className="hover:text-black transition-colors duration-200">
                Login
              </button>
              <button onClick={() => handleNavigate("signup")} className="hover:text-black transition-colors duration-200">
                Sign Up
              </button>
            </>
          )}
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
        {currentPage === "login" && (
          <LoginPage
            onNavigate={handleNavigate}
            onLogin={(user) => setCurrentUser(user)}
          />
        )}

        {currentPage === "signup" && <SignupPage onNavigate={handleNavigate} />}

        {currentPage === "mypage" && <MyPage onNavigate={handleNavigate} />}

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
            onSaveRecommendation={handleSaveRecommendation}
            isSavingRecommendation={isSavingRecommendation}
            savedRecommendationId={savedRecommendationId}
            saveMessage={saveMessage}
          />
        )}

        {currentPage === "personal-color" && (
          <PersonalColorPage
            onComplete={handlePersonalColorComplete}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === "skeleton" && (
          <SkeletonPage
            onComplete={handleSkeletonComplete}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === "body-shape" && (
          <BodyShapePage
            onComplete={handleBodyComplete}
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
