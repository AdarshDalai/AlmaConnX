import { Link } from "react-router-dom";
import { FaUserGraduate, FaBriefcase, FaUser } from "react-icons/fa";
import { PiStudent } from "react-icons/pi";
import '../styles/NavBar.css'


export default function NavBar() {
  return (
    <header className="navbar">
      <div className="navbar-container">

          <div className="logo">
            <Link to="/"><button className="logo-button">AlmaX</button></Link>
          </div>

          <nav className="nav-icons">
            <ul>
              <li>
                <Link to="/student">
                  <PiStudent  />
                </Link>
              </li>
              <li>
                <Link to="/alumni">
                  <FaUserGraduate />
                </Link>
              </li>
              <li>
                <Link to="/job">
                  <FaBriefcase />
                </Link>
              </li>
              <li>
                <Link to="/profile">
                  <FaUser />
                </Link>
              </li>
            </ul>
          </nav>
      </div>
    </header>
  );
}
