import React from 'react'
import {useNavigate} from "react-router-dom";

function NotFound() {

    const navigate = useNavigate();
    const BackTOHome = () => {
    navigate("/")
     } 
 return (
    <div>
      <h1>404 NotFound</h1>
      <button onClick={BackTOHome}>Back To Home</button>
    </div>
  )
}

export default NotFound;
