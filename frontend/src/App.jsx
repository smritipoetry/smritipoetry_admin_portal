import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./dashboard/layout/MainLayout";
import AdminIndex from "./dashboard/pages/admin_folder/AdminIndex";
import Login from "./dashboard/pages/Login";
import ProtectDashboard from "./middleware/protectDashboard";
import ProtectRole from "./middleware/ProtectRole";
import Unable from "./dashboard/pages/Unable";
import AddWriter from "./dashboard/pages/admin_folder/AddWriter";
import Writers from "./dashboard/pages/admin_folder/Writers";
import Poetry from "./dashboard/pages/admin_folder/Poetry";
import Profile from "./dashboard/pages/Profile";
import Writer from "./dashboard/pages/writer_folder/WriterIndex";
import CreatePoetry from "./dashboard/pages/writer_folder/CreatePoetry";
import CreatePoetryAdmin from "./dashboard/pages/admin_folder/CreatePoetryAdmin";
import UserSubmittedPoetry from "./dashboard/pages/admin_folder/UserSubmittedPoetry";
import EditPoetry from "./dashboard/pages/Edit_poetry";
import UserDashboard from "./dashboard/pages/userpage";
import CreateBlog from "./dashboard/pages/blog_folder/AddBlog";
import Blog from "./dashboard/pages/blog_folder/All_Blog";
import Editblog from "./dashboard/pages/blog_folder/Edit_blog";

function App() {
  const userInfo = {
    role: "writer",
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserDashboard />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<ProtectDashboard />}>
          <Route element={<MainLayout />}>
            {/* Redirect to /dashboard/admin or /dashboard/writer */}
            <Route
              path=""
              element={
                userInfo.role === "admin" ? (
                  <Navigate to="/dashboard/admin" />
                ) : (
                  <Navigate to="/dashboard/writer" />
                )
              }
            />

            {/* Unable access page */}
            <Route path="unable-access" element={<Unable />} />
            <Route path="poetry" element={<Poetry />} />
            <Route path="profile" element={<Profile />} />

            {/* Admin routes with role protection */}
            <Route element={<ProtectRole role="admin" />}>
              <Route path="admin" element={<AdminIndex />} />
              <Route path="writer/add" element={<AddWriter />} />
              <Route path="writers" element={<Writers />} />
              <Route
                path="poetry/createadmin"
                element={<CreatePoetryAdmin />}
              />
              <Route path="poetry/edit/:poetry_id" element={<EditPoetry />} />
              <Route
                path="poetry/usersubmittedpoetry"
                element={<UserSubmittedPoetry />}
              />
              <Route path="blog/add" element={<CreateBlog />} />
              <Route path="blog/edit/:blog_id" element={<Editblog />} />
              <Route path="blog" element={<Blog />} />
            </Route>

            {/* Writer routes with role protection */}
            <Route element={<ProtectRole role="writer" />}>
              <Route path="writer" element={<Writer />} />
              <Route path="poetry/create" element={<CreatePoetry />} />
              <Route path="poetry/edit/:poetry_id" element={<EditPoetry />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
