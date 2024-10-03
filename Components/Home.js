import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { Fade } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";
import "./mystyle.module.css";

const divStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundSize: "cover",
  height: "400px",
};
const slideImages = [
  {
    id: "1",
    url: "https://www.uwm.com/images/default-source/default-album/welcome_to_uwm.png",
  },
  {
    id: "2",
    url: "https://d1.awsstatic.com/industry-images-customer-references/BankBazaar-new_Image.6b94cb056c06c00ae22c60058ff335b784906d47.png",
  },
  {
    id: "3",
    url: "https://scontent.fhyd2-2.fna.fbcdn.net/v/t1.6435-9/91495314_10156679662707000_8079161267090096128_n.png?_nc_cat=111&ccb=1-7&_nc_sid=300f58&_nc_ohc=T6ii-ZHstMQAX8ot00s&_nc_ht=scontent.fhyd2-2.fna&oh=00_AfCdxtmAl74cVYR5mZyM6FkQkhUYyfQKkRq9_ZYxj23L8A&oe=64FD3D90"
    },
];

function Home() {
  const navigate = useNavigate();

  const navigateToSuccessPage = () => {
    navigate("/login");
  };

  return (
    <div>
      <div className="slide-container">
        <Fade>
          {slideImages.map((slideImage, id) => (
            <div key={id}>
              <div
                style={{
                  ...divStyle,
                  backgroundImage: `url(${slideImage.url})`,
                }}
              ></div>
            </div>
          ))}
        </Fade>
      </div><br/>
      
      <h2 className="Home_mission"><span style={{color:"red", fontWeight:"bold" , fontSize:"25px"}}> WHY </span> UWM? </h2> 
      <p className="sentaince"><i className="fa-solid fa-quote-left"></i> UWM is the #1 mortgage lender in the nation. For 37 years, we’ve been changing the game by offering elite client service, cutting-edge technology and some of the fastest turn times in the industry.<i className="fa-solid fa-quote-left"></i></p>
     
     <div className="video-content">

     <div className="video1">
       <container>
        <div className="ratio ratio-16x9">
        <iframe src="https://www.youtube.com/embed/X_XLjK9CaQ0" title="YouTube video" allowFullScreen></iframe>
        </div>
       </container>
     </div>

     <div className="video2">
       <container>
        <div className="ratio ratio-16x9">
        <iframe src="https://www.youtube.com/embed/bHQMbEJPh_g" title="YouTube video" allowFullScreen></iframe>
        </div>
       </container>
     </div>

     <div className="video3">
       <container>
        <div className="ratio ratio-16x9">
        <iframe src="https://www.youtube.com/embed/vYHSp2FWhYM" title="YouTube video" allowFullScreen></iframe>
        </div>
       </container>
     </div>
     </div><br/><br/><br/>

     <div className="div-content">
      <div className="get_Membership" onClick={navigateToSuccessPage}><i className="fa-solid fa-address-card"></i>  UWM <br/><b style={{color:"red"}}> FEATURES</b></div>
      <div className="become_Volunteer" onClick={navigateToSuccessPage}><i className="fa-solid fa-person"></i> GET A<br/><b style={{color:"red"}}> CALL</b></div>
      <div className="get_Email" onClick={navigateToSuccessPage}><i className="fa-solid fa-envelope"></i> Get <br/><b style={{color:"red"}}>RESOURCES</b></div>
      <div className="make_Donation" onClick={navigateToSuccessPage}><i className="fa-solid fa-person-circle-question"></i> EASE <br/><b style={{color:"red"}}>LOGIN</b></div>
     </div>

      {/* <h1>Home</h1>
      <button onClick={navigateToSuccessPage}>submit form</button> */}
    </div>

  );
}

export default Home;
