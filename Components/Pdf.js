import React from 'react'
import {Link , Outlet} from "react-router-dom";
import AOS from 'aos';
import 'aos/dist/aos.css'; 
AOS.init({
  duration: 400,
});

const Pdf = () => {
  return (
    <div>
    <div className='d-flex justify-content-center'  data-aos="slide-right"> 
      <Link className='btn-success btn-lg fw-bold my-5 p-2 text-decoration-none' to="/Pdf/exportPdf">Download</Link>
    </div>
    <Outlet />
    </div>
  );
}
export default Pdf;