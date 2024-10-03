import React from 'react';
import {useNavigate} from 'react-router-dom';

function Logout() {
  const navigate = useNavigate();
  return(
<div>
 <button onClick={ () => navigate("/")}>Click Mi Back to Home</button>
</div>
  )
}

export default Logout;
