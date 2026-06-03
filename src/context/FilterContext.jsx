import React, { createContext, useContext, useMemo, useState } from "react";
import useMappingStore from "../store/mappingStore";
import { getFilterOptions } from "../services/analyticsEngine";

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
  const { sheets, currentSheet } = useMappingStore();
  const sheet = currentSheet ? sheets[currentSheet] : null;

  const [filters, setFilters] = useState({
    branch: "",
    course: "",
    trainer: "",
    paymentStatus: "",
    studentStatus: "",
    location: "",
  });

  const options = useMemo(() => {
    if (!sheet?.headers || !sheet?.rows)
      return {
        branches: [],
        courses: [],
        trainers: [],
        paymentStatuses: [],
        studentStatuses: [],
        locations: [],
      };
    return getFilterOptions(sheet.headers, sheet.rows, currentSheet || "");
  }, [sheet, currentSheet]);

  const setFilter = (key, value) => {
    setFilters((state) => ({ ...state, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      branch: "",
      course: "",
      trainer: "",
      paymentStatus: "",
      studentStatus: "",
      location: "",
    });
  };

  return (
    <FilterContext.Provider
      value={{ filters, setFilter, resetFilters, options }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within FilterProvider");
  }
  return context;
}
