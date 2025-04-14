import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/profile/Profile";
import EditProfile from "./pages/profile/EditProfile";
import Jobs from "./pages/jobs/Jobs";
import JobDetail from "./pages/jobs/JobDetailPage";
import ApplicationStatus from "./pages/jobs/ApplicationStatus";
import Students from "./pages/users/Students";
import Alumni from "./pages/users/Alumni";
import UserDetail from "./pages/users/UserDetail";
import Dashboard from "./pages/officer/Dashboard";
import CreateJob from "./pages/officer/CreateJob";
import EditJob from "./pages/officer/EditJob";
import ApplicantList from "./pages/officer/ApplicantList";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/home" element={<Home />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Profile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/students" element={<Students />} />
            <Route path="/alumni" element={<Alumni />} />
            <Route path="/users/:userId" element={<UserDetail />} />
          </Route>

          <Route
            element={<ProtectedRoute allowedRoles={["student", "alumni"]} />}
          >
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:jobId" element={<JobDetail />} />
            <Route path="/applications" element={<ApplicationStatus />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["officer"]} />}>
            <Route path="/officer/dashboard" element={<Dashboard />} />
            <Route path="/officer/jobs/create" element={<CreateJob />} />
            <Route path="/officer/jobs/:jobId/edit" element={<EditJob />} />
            <Route
              path="/officer/jobs/:jobId/applicants"
              element={<ApplicantList />}
            />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
