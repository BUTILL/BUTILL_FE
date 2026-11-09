import Home from "./Home";
import { sampleDashboardData } from "../data/homeSample";
import "../css/App.css";

// API 연결 전에는 분리한 예시 데이터로 화면을 확인합니다.
// API 연결 후에는 서버 응답을 data에 전달하면 같은 화면이 갱신됩니다.
export default function App() {
  return <Home data={sampleDashboardData} />;
}


