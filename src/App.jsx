import React from "react";
import AppRouter from "./routes/Router";
import { FilterProvider } from "./context/FilterContext";

export default function App() {
  return (
    <FilterProvider>
      <AppRouter />
    </FilterProvider>
  );
}
