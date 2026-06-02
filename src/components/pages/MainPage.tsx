import { Dispatch, SetStateAction, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Ruler,
  Search,
  Shirt,
  SlidersHorizontal,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  BodyFeatureLevel,
  BodyRatioLevel,
  Page,
  StylePreference,
  UserProfile,
  WearingPurpose,
} from "../../types";
import {
  BODY_FEATURE_LABELS,
  BODY_RATIO_LABELS,
  HINTS,
  ITEMS_DB,
  PC_RESULTS,
  PURPOSE_OPTIONS,
  STYLE_OPTIONS,
} from "../../constants/data";

interface MainPageProps {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  selectedSkeleton: string;
  setSelectedSkeleton: (skeleton: string) => void;
  selectedBody: string;
  setSelectedBody: (body: string) => void;
  userProfile: UserProfile;
  setUserProfile: Dispatch<SetStateAction<UserProfile>>;
  onNavigate: (page: Page) => void;
  handleBackendSearch: (queryText: string) => Promise<void>;
  backendItems: any[];
  aiGuidance: string;
  isLoading: boolean;
  isSearched: boolean;
  setIsSearched: (searched: boolean) => void;
}

const colorQuickOptions = Object.values(PC_RESULTS).map((result) => result.name);
const skeletonQuickOptions = ["스트레이트", "내추럴", "웨이브", "스트레이트 + 내추럴 혼합형"];
const bodyQuickOptions = ["역삼각형", "삼각형", "직사각형", "모래시계", "타원형"];
const categoryIcons = [Shirt, Sparkles, SlidersHorizontal, Ruler, Shirt, Sparkles];

export function MainPage({
  selectedColor,
  setSelectedColor,
  selectedSkeleton,
  setSelectedSkeleton,
  selectedBody,
  setSelectedBody,
  userProfile,
  setUserProfile,
  onNavigate,
  handleBackendSearch,
  backendItems,
  aiGuidance,
  isLoading,
  isSearched,
}: MainPageProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("티셔츠");

  const selectedStyleLabels = userProfile.stylePreferences
    .map((value) => STYLE_OPTIONS.find((item) => item.value === value)?.label)
    .filter(Boolean);
  const selectedPurposeLabels = userProfile.wearingPurposes
    .map((value) => PURPOSE_OPTIONS.find((item) => item.value === value)?.label)
    .filter(Boolean);

  const profileScore = Math.min(
    96,
    58 +
      (userProfile.height ? 6 : 0) +
      (userProfile.weight ? 6 : 0) +
      userProfile.stylePreferences.length * 3 +
      userProfile.wearingPurposes.length * 3 +
      12,
  );

  const recommendationReasons = [
    `${selectedColor} 퍼스널컬러와 얼굴 주변 색 조화를 우선 반영`,
    `${selectedSkeleton} 골격에 맞는 소재감과 핏 밸런스 적용`,
    `${selectedBody} 체형의 어깨·허리·골반 비율 보완`,
    `${selectedStyleLabels.length ? selectedStyleLabels.join(", ") : "선호 스타일"} 취향과 ${
      selectedPurposeLabels.length ? selectedPurposeLabels.join(", ") : "착용 목적"
    } 상황 반영`,
  ];

  const updateProfile = (patch: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...patch }));
  };

  const toggleStyle = (value: StylePreference) => {
    setUserProfile((prev) => {
      const exists = prev.stylePreferences.includes(value);
      const next = exists ? prev.stylePreferences.filter((item) => item !== value) : [...prev.stylePreferences, value];
      return { ...prev, stylePreferences: next };
    });
  };

  const togglePurpose = (value: WearingPurpose) => {
    setUserProfile((prev) => {
      const exists = prev.wearingPurposes.includes(value);
      const next = exists ? prev.wearingPurposes.filter((item) => item !== value) : [...prev.wearingPurposes, value];
      return { ...prev, wearingPurposes: next };
    });
  };

  const handleSearchSubmit = () => {
    handleBackendSearch(searchQuery);
  };

  const handleHintClick = (hint: string) => {
    const q = `${selectedColor} ${selectedStyleLabels[0] || "미니멀"} ${hint} 추천`;
    setSearchQuery(q);
    handleBackendSearch(q);
  };

  const handleCategoryClick = (name: string) => {
    const q = `${selectedColor} ${selectedBody} 체형에 어울리는 ${name}`;
    setSearchQuery(q);
    handleBackendSearch(q);
  };

  const MetricInput = ({
    label,
    value,
    onChange,
    suffix,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    suffix: string;
  }) => (
    <label className="space-y-2">
      <span className="text-[12px] text-black/55">{label}</span>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-black/10 bg-black/[0.015] px-3 py-3 pr-10 text-[14px] outline-none transition-colors focus:border-black"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-black/35">{suffix}</span>
      </div>
    </label>
  );

  const SegmentButton = ({
    active,
    label,
    onClick,
  }: {
    active: boolean;
    label: string;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-2.5 text-[12px] transition-colors ${
        active ? "border-black bg-black text-white" : "border-black/10 text-black/55 hover:border-black/35"
      }`}
    >
      {label}
    </button>
  );

  const FeatureSelector = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: BodyFeatureLevel;
    onChange: (value: BodyFeatureLevel) => void;
  }) => (
    <div className="space-y-2">
      <p className="text-[12px] text-black/55">{label}</p>
      <div className="grid grid-cols-3 gap-1.5">
        {(["low", "medium", "high"] as BodyFeatureLevel[]).map((item) => (
          <SegmentButton
            key={item}
            active={value === item}
            label={BODY_FEATURE_LABELS[item]}
            onClick={() => onChange(item)}
          />
        ))}
      </div>
    </div>
  );

  const RatioSelector = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: BodyRatioLevel;
    onChange: (value: BodyRatioLevel) => void;
  }) => (
    <div className="space-y-2">
      <p className="text-[12px] text-black/55">{label}</p>
      <div className="grid grid-cols-3 gap-1.5">
        {(["short", "balanced", "long"] as BodyRatioLevel[]).map((item) => (
          <SegmentButton
            key={item}
            active={value === item}
            label={BODY_RATIO_LABELS[item]}
            onClick={() => onChange(item)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
      <aside className="space-y-6 lg:col-span-4 lg:border-r lg:border-black/5 lg:pr-10">
        <section className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.28em] text-black/30">01 / Profile Engine</p>
          <div className="space-y-2">
            <h2 className="text-2xl font-light tracking-tight">신체 정보 매트릭스</h2>
            <p className="max-w-sm text-[13px] leading-relaxed text-black/45">
              진단 결과와 사용자 입력값을 함께 사용해 AI 추천의 근거를 명확하게 만듭니다.
            </p>
          </div>
        </section>

        <section className="rounded-lg border border-black/10 p-4 sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/30">Basic Info</p>
              <p className="mt-1 text-[15px] font-medium text-black">기본 정보</p>
            </div>
            <UserRound size={18} className="text-black/35" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <SegmentButton active={userProfile.gender === "male"} label="남성" onClick={() => updateProfile({ gender: "male" })} />
            <SegmentButton active={userProfile.gender === "female"} label="여성" onClick={() => updateProfile({ gender: "female" })} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <MetricInput label="키" suffix="cm" value={userProfile.height} onChange={(height) => updateProfile({ height })} />
            <MetricInput label="몸무게" suffix="kg" value={userProfile.weight} onChange={(weight) => updateProfile({ weight })} />
          </div>
        </section>

        <section className="rounded-lg border border-black/10 p-4 sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/30">Body Features</p>
              <p className="mt-1 text-[15px] font-medium text-black">체형 관련 입력</p>
            </div>
            <Ruler size={18} className="text-black/35" />
          </div>
          <div className="space-y-4">
            <FeatureSelector
              label="어깨 넓이 인식"
              value={userProfile.shoulderWidth}
              onChange={(shoulderWidth) => updateProfile({ shoulderWidth })}
            />
            <FeatureSelector
              label="허리 라인"
              value={userProfile.waistLine}
              onChange={(waistLine) => updateProfile({ waistLine })}
            />
            <FeatureSelector
              label="골반 너비"
              value={userProfile.hipWidth}
              onChange={(hipWidth) => updateProfile({ hipWidth })}
            />
            <RatioSelector
              label="다리 비율"
              value={userProfile.legRatio}
              onChange={(legRatio) => updateProfile({ legRatio })}
            />
            <RatioSelector
              label="상체/하체 비율"
              value={userProfile.upperLowerRatio}
              onChange={(upperLowerRatio) => updateProfile({ upperLowerRatio })}
            />
          </div>
        </section>

        <section className="rounded-lg border border-black/10 p-4 sm:p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-black/30">Style Preferences</p>
          <p className="mt-1 text-[15px] font-medium text-black">스타일 선호도</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {STYLE_OPTIONS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => toggleStyle(item.value)}
                className={`rounded-lg border px-3 py-2 text-[12px] transition-colors ${
                  userProfile.stylePreferences.includes(item.value)
                    ? "border-black bg-black text-white"
                    : "border-black/10 text-black/55 hover:border-black/35"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-black/10 p-4 sm:p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-black/30">Wearing Purpose</p>
          <p className="mt-1 text-[15px] font-medium text-black">착용 목적</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {PURPOSE_OPTIONS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => togglePurpose(item.value)}
                className={`rounded-lg border px-3 py-2 text-[12px] transition-colors ${
                  userProfile.wearingPurposes.includes(item.value)
                    ? "border-black bg-black text-white"
                    : "border-black/10 text-black/55 hover:border-black/35"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          {[
            {
              eyebrow: "Personal Color",
              value: selectedColor || "미진단",
              action: () => onNavigate("personal-color"),
              quick: colorQuickOptions,
              setter: setSelectedColor,
            },
            {
              eyebrow: "Skeleton Struct",
              value: selectedSkeleton,
              action: () => onNavigate("skeleton"),
              quick: skeletonQuickOptions,
              setter: setSelectedSkeleton,
            },
            {
              eyebrow: "Body Silhouette",
              value: selectedBody,
              action: () => onNavigate("body-shape"),
              quick: bodyQuickOptions,
              setter: setSelectedBody,
            },
          ].map((card) => (
            <div key={card.eyebrow} className="rounded-lg border border-black/10 p-4 transition-colors hover:border-black/30">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-black/30">{card.eyebrow}</p>
                  <p className="mt-1 text-[15px] font-medium tracking-tight text-black">{card.value}</p>
                </div>
                <button
                  type="button"
                  onClick={card.action}
                  className="inline-flex items-center gap-1 rounded-lg border border-black/10 px-3 py-2 text-[11px] uppercase tracking-wide text-black/45 transition-colors hover:border-black hover:text-black"
                >
                  진단 <ChevronRight size={12} />
                </button>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {card.quick.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => card.setter(item)}
                    className={`shrink-0 rounded-lg border px-3 py-2 text-[11px] transition-colors ${
                      card.value === item ? "border-black bg-black text-white" : "border-black/10 text-black/50 hover:border-black/30"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
      </aside>

      <section className="space-y-9 lg:col-span-8">
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.28em] text-black/30">02 / Deep Match Engine</p>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-light tracking-tight sm:text-4xl">AI 스타일 큐레이션</h1>
              <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-black/50">
                패션 플랫폼의 상품 탐색과 AI 진단 서비스를 하나의 흐름으로 연결해, 결과와 추천 이유를 함께 보여줍니다.
              </p>
            </div>
            <div className="rounded-lg border border-black/10 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/30">Profile Confidence</p>
              <p className="mt-1 text-2xl font-light">{profileScore}%</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-black p-4 sm:p-5">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-4 text-black/35" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
              placeholder="예: 면접에 입을 겨울 딥 미니멀 자켓 추천"
              className="w-full rounded-lg border border-black/10 bg-black/[0.015] py-3.5 pl-11 pr-24 text-[14px] text-black outline-none transition-colors placeholder:text-black/30 focus:border-black"
            />
            <button
              type="button"
              onClick={handleSearchSubmit}
              className="absolute right-2 rounded-lg bg-black px-4 py-2 text-[11px] uppercase tracking-wider text-white transition-colors hover:bg-black/80"
            >
              Search
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[10px] uppercase tracking-wider text-black/30">추천 힌트</span>
            {HINTS.map((hint) => (
              <button
                key={hint}
                type="button"
                onClick={() => handleHintClick(hint)}
                className="rounded-lg border border-black/10 px-3 py-1.5 text-[11px] text-black/55 transition-colors hover:border-black/30 hover:text-black"
              >
                {hint}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-black/10 bg-black/[0.015] p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/30">Explainable Recommendation</p>
              <h3 className="mt-1 text-lg font-light">추천 프로필 요약</h3>
            </div>
            <CheckCircle2 size={18} className="text-black/45" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {recommendationReasons.map((reason) => (
              <div key={reason} className="rounded-lg border border-black/5 bg-white px-3 py-3 text-[12px] leading-relaxed text-black/60">
                {reason}
              </div>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-dashed border-black/15 p-12 text-center">
            <div className="mx-auto h-6 w-6 rounded-full border-2 border-black border-t-transparent animate-spin" />
            <p className="mt-4 text-[13px] font-light leading-relaxed text-black/60">
              취향과 진단 결과를 훑어보면서 어울리는 상품을 고르는 중이에요.
            </p>
          </div>
        ) : isSearched ? (
          <div className="animate-fadeIn space-y-6">
            {aiGuidance && (
              <div className="whitespace-pre-line rounded-lg border border-black/10 bg-white p-5 text-[13px] font-light leading-relaxed text-black/70">
                <strong className="mb-2 block text-[10px] uppercase tracking-[0.22em] text-black/35">Style Match Note</strong>
                {aiGuidance}
              </div>
            )}

            <div>
              <h3 className="mb-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-black/40">
                맞춤 상품 매칭 결과 ({backendItems.length}개)
                <span className="h-px flex-1 bg-black/5" />
              </h3>

              {backendItems.length === 0 ? (
                <p className="rounded-lg border border-black/10 py-8 text-center text-[13px] font-light text-black/40">
                  이번 조건과 딱 맞는 상품을 찾지 못했어요. 상황이나 아이템명을 조금 바꿔서 다시 찾아볼게요.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {backendItems.map((item: any, i: number) => {
                    const titleText = String(item.title || item.productName || "추천 상품").replace(/<[^>]*>?/g, "");
                    const isLocalItem = String(item.link || "").startsWith("#");
                    const ProductIcon = item.productType === "beauty" ? Sparkles : Shirt;
                    const reasons = item.recommendationReason
                      ? [item.recommendationReason, ...recommendationReasons.slice(0, 2)]
                      : recommendationReasons.slice(0, 3);

                    return (
                      <a
                        key={`${item.link || item.id || titleText}-${i}`}
                        href={item.link || "#"}
                        target={isLocalItem ? undefined : "_blank"}
                        rel={isLocalItem ? undefined : "noopener noreferrer"}
                        className="group flex h-full flex-col overflow-hidden rounded-lg border border-black/10 bg-white transition-colors hover:border-black/30"
                      >
                        <div className="flex aspect-[3/4] w-full items-center justify-center overflow-hidden border-b border-black/5 bg-black/[0.02]">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={titleText}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-black/[0.018] px-5 text-center">
                              <ProductIcon size={38} className="text-black/25" />
                              <span className="text-[10px] uppercase tracking-[0.18em] text-black/25">
                                {item.imagePath || "Local Product"}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col justify-between gap-4 p-4">
                          <div>
                            <p
                              className="mb-1 line-clamp-2 text-[13px] font-medium leading-snug text-black"
                              dangerouslySetInnerHTML={{ __html: item.title || titleText }}
                            />
                            <p className="text-[11px] text-black/40">{item.mallName || "쇼핑 결과"}</p>
                            <p className="mt-2 text-[15px] font-semibold text-black">
                              {Number(item.lprice || 0).toLocaleString()}원
                            </p>
                            {typeof item.matchScore === "number" && (
                              <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-black/30">
                                Match {item.matchScore}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1.5 rounded-lg bg-black/[0.015] p-3">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-black/30">추천 이유</p>
                            {reasons.map((reason) => (
                              <p key={reason} className="text-[11px] leading-relaxed text-black/55">
                                - {reason}
                              </p>
                            ))}
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="mb-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-black/40">
              추천 패션 카테고리 <span className="h-px flex-1 bg-black/5" />
            </h3>
            <div className="mb-6 flex gap-2 overflow-x-auto border-b border-black/5 pb-2">
              {Object.keys(ITEMS_DB).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-[12px] transition-colors ${
                    selectedCategory === cat ? "bg-black text-white" : "text-black/45 hover:bg-black/[0.035] hover:text-black"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {ITEMS_DB[selectedCategory]?.map((name, i) => {
                const Icon = categoryIcons[i % categoryIcons.length];
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleCategoryClick(name)}
                    className="group rounded-lg border border-black/10 bg-white p-4 text-left transition-colors hover:border-black/30"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-black/[0.035]">
                      <Icon size={18} className="text-black/55" />
                    </div>
                    <p className="text-[13px] font-medium leading-snug text-black">{name}</p>
                    <p className="mt-1 text-[11px] text-black/35">{selectedCategory}</p>
                    <div className="mt-4 inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-black/35 transition-colors group-hover:text-black">
                      추천 보기 <ArrowUpRight size={12} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
export default MainPage;
