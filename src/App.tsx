import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./screens/HomePage";
import { SearchResults } from "./screens/SearchResults";
import { ExperienceDetail } from "./screens/ExperienceDetail";
import { Checkout } from "./screens/Checkout";
import { BookingConfirmation } from "./screens/BookingConfirmation";

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/experience/:id" element={<ExperienceDetail />} />
        <Route path="/checkout/:id" element={<Checkout />} />
        <Route path="/confirmation/:id" element={<BookingConfirmation />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
