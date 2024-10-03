import React from 'react';
import {useNavigate} from "react-router-dom";

function Success() {

    const navigate = useNavigate();

    const BackToHomePage = () =>{
        navigate("/")
    }
  return (
    <div>
      <h2>Successfully Submitted</h2>
      <button onClick={BackToHomePage}>Home Page </button>
    </div>
  )
}

export default Success;
