import { useState, useEffect } from "react";
import type { SetPage } from "../../types/navigation";
import logoName from "../../assets/logoName.png";
import "./BusinessInfoPage.css";
import { categories, regions } from "../../data/businessOptions";

function BusinessInfoPage({ setPage }: { setPage: SetPage }) {
  // 저장된 정보 불러오기
const [businessStatus, setBusinessStatus] = useState(
  () => localStorage.getItem("businessStatus") || ""
);

const [selectedRegion, setSelectedRegion] = useState(
  () => localStorage.getItem("selectedRegion") || ""
);

const [selectedCategory, setSelectedCategory] = useState(
  () => localStorage.getItem("selectedCategory") || ""
);

// 선택한 정보 저장
useEffect(() => {
  localStorage.setItem("businessStatus", businessStatus);
  localStorage.setItem("selectedRegion", selectedRegion);
  localStorage.setItem("selectedCategory", selectedCategory);
}, [businessStatus, selectedRegion, selectedCategory]);

  const handleNext = () => {
    const information = {
      businessStatus,
      region: selectedRegion,
      category: selectedCategory
    };

    console.log(information);
    setPage("Information2");
  };


  return (
    <div className="information-page">
        <header className="information-header"> {/*헤더*/}

          <button
            className="back-button"
            onClick={() => setPage("Login")}
          >
            ←
          </button>

          <img
            src={logoName}
            alt="BUTILL"
            className="information-logo"
          />
        </header>

        {/* 진행바 */}
        <div className="information-progress">
          <div className="information-progress-fill"></div>
        </div>


        <main className="information-content">   

          <h1>
            어떤 상황의<br />
            대표님이신가요?
          </h1>

          <p className="information-description">
            맞춤형 현금 흐름 가이드와 지역 상권 데이터를
            <br/>정밀하게 비교해 제공해 드려요.
          </p>


          {/* 현재 비즈니스 상태 */}
          <section className="information-section">
            <div className="section-title-row">

              <h2>현재 비즈니스 상태</h2>
              <span className="required">
                필수 선택
              </span>
            </div>


            <button
              className={
                businessStatus === "startup"? "status-card selected": "status-card"
              }
              onClick={() => setBusinessStatus("startup")}
            >

              <span className="status-icon">
                🚀
              </span>

              <span className="status-name">
                창업 준비자
              </span>

              {businessStatus === "startup" && (
                <span className="check-icon">
                  ✓
                </span>
              )}
            </button>


            <button
              className={
                businessStatus === "running"? "status-card selected": "status-card"
              }
              onClick={() => setBusinessStatus("running")}
            >

              <span className="status-icon">
                🏢
              </span>

              <span className="status-name">
                사업장 운영 중
              </span>

              {businessStatus === "running" && (
                <span className="check-icon">
                  ✓
                </span>
              )}

            </button>
          </section>


          {/* 희망 지역 */}
          <section className="information-section">

            <h2>
              희망 지역
              <span className="small-text">
                (서울시)
              </span>
            </h2>

            <div className="region-grid">
              {regions.map((region) => (
                <button
                  key={region}
                  className={
                    selectedRegion === region? "region-button selected": "region-button"
                  }
                  onClick={() => setSelectedRegion(region)}
                >
                  {region}
                </button>
              ))}
            </div>
          </section>


          {/* 희망 / 영위 업종 */}
          <section className="information-section">

            <h2>
              희망 / 영위 업종
            </h2>

            <div className="category-grid">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={
                    selectedCategory === category.id? "category-card selected": "category-card"
                  }
                  onClick={() =>
                    setSelectedCategory(category.id)
                  }
                >

                  <span className="category-name">
                    {category.name}
                  </span>

                  {selectedCategory === category.id && (
                    <span className="category-check">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>
        </main>


        {/* 하단 버튼 */}
        <div className="information-bottom">

          <button
            className="next-button"
            onClick={handleNext}
          >
            다음 단계
            <span> → </span>
          </button>
        </div>
    </div>
  );
}

export default BusinessInfoPage;