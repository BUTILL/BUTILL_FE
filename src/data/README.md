# 현금흐름 데이터 연결

`Home`에 `data` 속성으로 객체를 전달합니다. 데이터를 교체하면 그래프와 목록이 같이 갱신됩니다.

```tsx
<Home data={responseData} />
```

응답 형식은 `homeData.ts`의 `DashboardData`입니다.

```json
{
  "startMonth": "2026-11",
  "openingBalance": 24450000,
  "monthlyCashFlows": [
    { "month": "2026-11", "income": 15000000, "expense": 16950000 },
    { "month": "2026-12", "income": 12000000, "expense": 9500000, "isForecast": true }
  ]
}
```

- `startMonth`: 해당 사업장의 앱 사용 시작 월. 거래 데이터의 첫 월에서 추정하지 않습니다.
- `openingBalance`: 시작 월의 거래를 반영하기 전 잔액.
- `income`, `expense`: 원 단위 정수. 지출에는 부가세가 포함되어야 합니다.
- `taxPayment`: 지출 중 부가세 금액. 잔고에서 별도로 차감하지 않습니다.
- `isForecast`: 예측 월이면 `true`. 입력 거래와 구분하여 표시합니다.
- 월별 항목은 순서와 관계없이 처리하며, 중복 월은 데이터 오류입니다.
- 그래프는 시작 월부터 12개월, 목록은 같은 결과의 앞 6개월입니다.
- 없는 달은 0원이 아닌 미입력으로 표시합니다. 누락 이후 누적 잔고와 잔고선은 확인할 수 없습니다.
- 실제 0원 수입·지출은 숫자 `0`으로 전달해야 합니다.

현재 `App.jsx`는 화면 확인용 `homeSample.ts`를 전달합니다. 실제 API 주소는 아직 없으므로 네트워크 요청은 추가하지 않았습니다. API가 정해지면 요청 결과를 `data`에 전달하도록 `App.jsx`를 변경하세요.
