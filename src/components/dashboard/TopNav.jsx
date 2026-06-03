import React from "react";
import { FiSearch, FiBell, FiSun, FiMoon } from "react-icons/fi";
import useThemeStore from "../../store/themeStore";

export default function TopNav() {
  const { dark, toggle } = useThemeStore();

  return (
    <header className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <div className="relative hidden sm:block">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <FiSearch />
          </span>
          <input
            className="pl-10 pr-4 py-2 rounded bg-gray-100 dark:bg-gray-700 border border-transparent focus:border-gray-300"
            placeholder="Search..."
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
          <FiBell />
        </button>
        <button
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={toggle}
          aria-label="Toggle theme"
        >
          {dark ? <FiSun /> : <FiMoon />}
        </button>
        <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600"></div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold">Admin</div>
            <div className="text-xs text-gray-500">lasak@example.com</div>
          </div>
        </div>
      </div>
    </header>
  );
}
