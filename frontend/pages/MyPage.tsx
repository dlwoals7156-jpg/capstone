import { useEffect, useState } from "react";
import { LogIn, RefreshCw } from "lucide-react";
import { MyPageDashboard, Page } from "../src/types";
import { getMyPageDashboard } from "../services/authService";
import { BackButton } from "../components/BackButton";
import { PageHeader } from "../components/PageHeader";

interface MyPageProps {
  onNavigate: (page: Page) => void;
}

const genderLabel = (gender?: string | null) => (gender === "male" ? "남성" : gender === "female" ? "여성" : "미입력");

export function MyPage({ onNavigate }: MyPageProps) {
  const [dashboard, setDashboard] = useState<MyPageDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadDashboard = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const data = await getMyPageDashboard();
      setDashboard(data);
    } catch {
      setMessage("로그인이 필요합니다. 로그인 페이지로 이동해 주세요.");
      setDashboard(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  return (
    <section className="mx-auto max-w-5xl">
      <BackButton onClick={() => onNavigate("main")} />
      <PageHeader
        num="My DeepLook"
        title="마이페이지"
        sub="로그인한 사용자의 최근 분석 결과와 추천 저장 이력을 확인합니다."
      />

      {isLoading && (
        <div className="rounded-lg border border-black/10 p-8 text-center text-[13px] text-black/45">
          마이페이지 정보를 불러오는 중입니다.
        </div>
      )}

      {!isLoading && !dashboard && (
        <div className="rounded-lg border border-black/10 p-6 text-center">
          <p className="text-[13px] text-black/55">{message}</p>
          <button
            type="button"
            onClick={() => onNavigate("login")}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-[12px] uppercase tracking-widest text-white"
          >
            <LogIn size={14} /> Login
          </button>
        </div>
      )}

      {dashboard && (
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="space-y-5">
            <div className="rounded-lg border border-black/10 p-5">
              <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">Account</p>
              <h2 className="mt-2 text-2xl font-light">{dashboard.user.nickname}</h2>
              <div className="mt-5 space-y-3 text-[13px] text-black/60">
                <div className="flex justify-between gap-4 border-b border-black/5 pb-3">
                  <span>이메일</span>
                  <span className="text-right text-black/75">{dashboard.user.email}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>성별</span>
                  <span className="text-black/75">{genderLabel(dashboard.user.gender)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={loadDashboard}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-black/20 px-4 py-3 text-[12px] uppercase tracking-widest text-black/60 transition-colors hover:border-black"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </aside>

          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-black/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-black/35">Personal Color</p>
                <p className="mt-3 text-xl font-light">
                  {dashboard.latest_personal_color
                    ? `${dashboard.latest_personal_color.season} ${dashboard.latest_personal_color.tone}`.trim()
                    : "기록 없음"}
                </p>
                {dashboard.latest_personal_color && (
                  <p className="mt-2 text-[12px] text-black/45">
                    신뢰도 {Math.round(dashboard.latest_personal_color.confidence * 100)}%
                  </p>
                )}
              </div>
              <div className="rounded-lg border border-black/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-black/35">Skeletal Type</p>
                <p className="mt-3 text-xl font-light">{dashboard.latest_skeleton_type?.skeleton_type || "기록 없음"}</p>
                {dashboard.latest_skeleton_type && (
                  <p className="mt-2 text-[12px] text-black/45">
                    신뢰도 {Math.round(dashboard.latest_skeleton_type.confidence * 100)}%
                  </p>
                )}
              </div>
              <div className="rounded-lg border border-black/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-black/35">Body Shape</p>
                <p className="mt-3 text-xl font-light">{dashboard.latest_body_shape?.body_shape || "기록 없음"}</p>
                {dashboard.latest_body_shape && (
                  <p className="mt-2 text-[12px] text-black/45">
                    신뢰도 {Math.round(dashboard.latest_body_shape.confidence * 100)}%
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-black/10 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-black/35">Recent Recommendations</p>
                  <h3 className="mt-1 text-xl font-light">추천 아이템 목록</h3>
                </div>
                <span className="text-[11px] text-black/35">{dashboard.recommendations.length} saved</span>
              </div>

              <div className="mt-5 space-y-4">
                {dashboard.recommendations.length === 0 && (
                  <p className="rounded-lg bg-black/[0.015] p-4 text-[13px] text-black/45">
                    아직 저장된 추천 결과가 없습니다. 로그인 상태에서 추천 검색을 실행하면 이곳에 저장됩니다.
                  </p>
                )}

                {dashboard.recommendations.map((recommendation) => (
                  <div key={recommendation.id} className="rounded-lg border border-black/5 bg-black/[0.015] p-4">
                    <p className="text-[11px] text-black/35">{recommendation.created_at}</p>
                    <p className="mt-2 text-[13px] leading-relaxed text-black/60">{recommendation.recommended_style}</p>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {recommendation.recommended_items.slice(0, 4).map((item) => (
                        <a
                          key={item.id}
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-black/5 bg-white px-3 py-3 transition-colors hover:border-black/25"
                        >
                          <p className="truncate text-[13px] text-black/75">{item.title}</p>
                          <p className="mt-1 text-[11px] text-black/35">
                            {item.brandName} · {item.matchConfidence}%
                          </p>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default MyPage;
