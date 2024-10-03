import React from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css'; // You can also use <link> for styles
// ..
AOS.init({
  duration: 1200,
});

function CreditCards() {
  return (
    <div className='Political_table'  data-aos="fade-down" style={{backgroundColor:"green"}}>
       <h1>Credit Cards </h1>
  </div>
);
}

export default CreditCards;
