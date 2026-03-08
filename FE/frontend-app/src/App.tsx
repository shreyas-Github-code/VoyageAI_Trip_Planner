import { HashRouter, Route, Routes } from 'react-router-dom';
import HistoryPage from './components/HistoryPage';
import TourGuide from './components/Tg';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<TourGuide />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
