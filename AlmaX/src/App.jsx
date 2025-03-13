import { BrowserRouter as Router, Routes, Route} from "react-router-dom"
import NavBar from './components/NavBar';
import HomeStudent from "./pages/HomeStudent";
import Students from "./pages/Students";
import Alumni from "./pages/Alumni";
import Job from "./pages/Job";
import UserProfile from "./pages/UserProfile";
import './styles/App.css'
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <NavBar />
      <div className="content-container">
        <Routes>
          <Route path="/" element={<HomeStudent />} />
          <Route path="/student" element={<Students />} />
          <Route path="/alumni" element={<Alumni />} />
          <Route path="/job" element={<Job />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </div>
      <Footer/>
    </Router>
  );
}


export default App
