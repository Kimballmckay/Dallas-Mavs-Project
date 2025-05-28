import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import BigBoard from "./pages/BigBoard";
import Prospects from "./pages/Prospects";
import PlayerProfile from "./pages/PlayerProfile";
import ScoutRankings from "./pages/ScoutRankings";

// ScrollToTop component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <div className="App">
        {/* This component will scroll to top on route changes */}
        <ScrollToTop />

        {/* NavBar appears on all pages */}
        <NavBar />

        {/* Routes for different pages */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/big-board" element={<BigBoard />} />
          <Route path="/prospects" element={<Prospects />} />
          <Route path="/player-profile/:playerId" element={<PlayerProfile />} />
          <Route path="/scout-rankings" element={<ScoutRankings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
