import { BrowserRouter, Routes, Route } from 'react-router';
import { HomeScreen } from './screens/HomeScreen';
import { GameScreenWrapper } from './screens/GameScreenWrapper';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/game/:id" element={<GameScreenWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}
