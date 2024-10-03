import React from "react";
// import { Link } from "react-router-dom";
import "./mystyle.module.css";

function About() {
  return (
    <main>
      <section className="section primary-background-dark">
        <div className="section-center about-section">
          <artical className="about-content">
            <h1>
              UWM
              <br />
              <span>United Wholesale Mortgage</span>
            </h1>
            <p>
              United Wholesale Mortgage (UWM) is a leading wholesale lender that
              works with mortgage brokers to offer various types of mortgages to
              meet the diverse needs of homebuyers. Whether you’re a first-time
              homebuyer or looking to refinance your existing mortgage, UWM may
              be a good source for conventional and jumbo mortgages, as well as
              U.S. Department of Veterans Affairs (VA) home loans, U.S.
              Department of Agriculture (USDA) loans and refinancing..
            </p>
            <a className="button-global" href="#" target="_blank">
              Click More
            </a>
          </artical>

          <artical className="about-img-container">
            <div className="out-div">
              <img
                className="about-main-image"
                src="https://globalfintechseries.com/wp-content/uploads/2021/10/United-Wholesale-Mortgage-Completes-First-Ever-Cryptocurrency-Mortgage-Payment-Transactions.jpg"/>
            </div>
            <div className="in-div">
              <img
                className="about-small-image"
                src="https://i.ytimg.com/vi/4leWpFa1Yw4/oar2.jpg?sqp=-oaymwEfCNAFENAFSFryq4qpAxEIARUAAAAAJQAAyEI9AICiQw==&rs=AOn4CLB-DtQG95ZPLo4ltwgOhDKjzJwfuQ" />
            </div>
          </artical>
        </div>
      </section>
    </main>
  );
}

export default About;



