import React,{useState} from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "./auth";
import "./mystyle.module.css";

function Navbar() {
  const { user, logout } = useAuth();
  const [state, setState] = useState({clicked:"false"})

  const handleClick = () =>{
   setState({clicked : !state.clicked})
  }

  return (
    <div>
      <nav className="primary-nav">
        <a href="">
          <img className="wholesaleimg" src="https://companieslogo.com/img/orig/UWMC_BIG.D-6bb12e0c.png?t=1660464327" alt="Wholesale_Image"/>
        </a>
        <div>
        <ul id="navbar" className={state.clicked ? "#navbar active" : "#navbar"}>
        <li className="nav-link">
        <NavLink to="/" className="">Home</NavLink>
        </li>
        <li className="nav-link">
        <NavLink to="/about"className="nav-link">About</NavLink>
        </li>
        <li className="nav-link">
        <NavLink to="/loan" className="nav-link">Loans</NavLink>
        </li>
        <li className="nav-link">
        <NavLink to="/cards" className="nav-link">Cards</NavLink>
        </li>
        <li className="nav-link">
        <NavLink to="/pdf" className="nav-link">Summary</NavLink>
        </li>
        <li className="nav-link">
        <NavLink to="/creditScore" className="nav-link"> Credit Score</NavLink>
        </li>

        {user ? (
          <li className="nav-link">
          <NavLink to="/logout" className="nav-link" onClick={logout}>
            Logout
          </NavLink>
          </li>
        ) : (
          <li className="nav-link">
          <NavLink to="/login" className="nav-link" >Agent Login</NavLink>
          </li>   
        )}
        </ul>
        </div>

        <div id="mobile" onClick={handleClick}>
         <i id="bar" className={state.clicked ? "fas fa-times" : "fas fa-bars"}></i>
        </div>

      </nav>
    </div>
  );
}

export default Navbar;
