import { useState, useCallback } from "react";

export function useDrillDown() {
  const [state, setState] = useState({ open: false, title: "", rows: [] });

  const openDrillDown = useCallback((title, rows) => {
    setState({ open: true, title, rows: rows ?? [] });
  }, []);

  const closeDrillDown = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  return { drillDown: state, openDrillDown, closeDrillDown };
}
