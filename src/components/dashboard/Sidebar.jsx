import React from "react";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiCreditCard,
  FiMail,
  FiBook,
  FiMap,
  FiUser,
  FiBarChart2,
  FiUpload,
  FiSettings,
} from "react-icons/fi";

const items = [
  { to: "/", label: "Dashboard", icon: <FiHome /> },
  { to: "/students", label: "Students", icon: <FiUsers /> },
  { to: "/payments", label: "Payments", icon: <FiCreditCard /> },
  { to: "/leads", label: "Leads", icon: <FiMail /> },
  { to: "/courses", label: "Courses", icon: <FiBook /> },
  { to: "/branches", label: "Branches", icon: <FiMap /> },
  { to: "/trainers", label: "Trainers", icon: <FiUser /> },
  { to: "/analytics", label: "Analytics", icon: <FiBarChart2 /> },
  { to: "/inspection", label: "Data Inspection", icon: <FiSettings /> },
  { to: "/upload", label: "Upload Excel", icon: <FiUpload /> },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 p-4 hidden md:block">
      <div className="mb-8 text-xl font-semibold">Lasak Analytics</div>
      <nav className="space-y-1">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-fast ${
                isActive ? "bg-gray-100 dark:bg-gray-700 font-semibold" : ""
              }`
            }
          >
            <span className="text-lg">{it.icon}</span>
            <span>{it.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
