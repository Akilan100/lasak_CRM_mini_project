import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import Students from "../pages/Students";
import Payments from "../pages/Payments";
import Leads from "../pages/Leads";
import Courses from "../pages/Courses";
import Branches from "../pages/Branches";
import Trainers from "../pages/Trainers";
import Analytics from "../pages/Analytics";
import Inspection from "../pages/Inspection";
import Upload from "../pages/Upload";
import Login from "../pages/Login";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="payments" element={<Payments />} />
        <Route path="leads" element={<Leads />} />
        <Route path="courses" element={<Courses />} />
        <Route path="branches" element={<Branches />} />
        <Route path="trainers" element={<Trainers />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="inspection" element={<Inspection />} />
        <Route path="upload" element={<Upload />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
