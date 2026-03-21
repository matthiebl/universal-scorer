import { BrowserRouter, Routes, Route } from 'react-router';
import { HomeScreen } from './screens/HomeScreen';
import { GameScreenWrapper } from './screens/GameScreenWrapper';
import { PresetsScreen } from './screens/PresetsScreen';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/game/:id" element={<GameScreenWrapper />} />
        <Route path="/presets" element={<PresetsScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
