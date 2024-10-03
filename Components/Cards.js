import React from 'react'
import {Link , Outlet} from "react-router-dom";
import AOS from 'aos';
import 'aos/dist/aos.css'; // You can also use <link> for styles
// ..
AOS.init({
  duration: 400,
});

function Cards() {
  return (
    <div>
     
      <div className='Featured-nav'> 

        <div className='Project_01'  data-aos="slide-right">
        <Link className='Project_Link' to="/cards/creditCards">Credit Cards</Link>
        </div>
        <div className='Project_02' data-aos="slide-left">
        <Link className='Project_Link' to="/cards/debitCards"> Debit Cards </Link>
        </div>

      </div>
      <Outlet />
    </div>
  )
}

export default Cards;
