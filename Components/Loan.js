import React, { useState } from "react";
import { Outlet, Link } from "react-router-dom";

function Loans() {
  const [borrowerDropdownOpen, setBorrowerDropdownOpen] = useState(false);
  const [financialDropdownOpen, setFinancialDropdownOpen] = useState(false);
  const [productionDropdownOpen, setProductionDropdownOpen] = useState(false);
  const [propertyInfoDropdownOpen, setPropertyInfoDropdownOpen] =
    useState(false);
  const [rateLockingDropdownOpen, setRateLockingDropdownOpen] = useState(false);
  const [
    governmentMonitoringDropdownOpen,
    setGovernmentMonitoringDropdownOpen,
  ] = useState(false);

  const [
    eligibilityAssessmentDropdownOpen,
    setEligibilityAssessmentDropdownOpen,
  ] = useState(false);

  const toggleBorrowerDropdown = () => {
    setBorrowerDropdownOpen(!borrowerDropdownOpen);
  };

  const toggleFinancialDropdown = () => {
    setFinancialDropdownOpen(!financialDropdownOpen);
  };

  const toggleProductionDropdown = () => {
    setProductionDropdownOpen(!productionDropdownOpen);
  };

  const togglePropertyInfoDropdown = () => {
    setPropertyInfoDropdownOpen(!propertyInfoDropdownOpen);
  };

  const toggleRateLockingDropdown = () => {
    setRateLockingDropdownOpen(!rateLockingDropdownOpen);
  };

  const toggleGovernmentMonitoringDropdown = () => {
    setGovernmentMonitoringDropdownOpen(!governmentMonitoringDropdownOpen);
  };

  const toggleEligibilityAssessmentDropdown = () => {
    setEligibilityAssessmentDropdownOpen(!eligibilityAssessmentDropdownOpen);
  };

  return (
    <div>
      <div className="loans_div">
        <div className="Loan-nav">
          {/* Borrower Personal Details Dropdown */}
          <div className="slide_bar" data-aos="slide-right">
            <div
              className="loan_Link  d-flex flex-colum justify-content-between bg-dark text-white p4"
              onClick={toggleBorrowerDropdown}
              style={{
                textDecoration: "none",
                cursor: "pointer",
                fontSize: "10px",
              }}
            >
              Borrower Personal Details Page &#9662;
            </div>
            <hr className="text-secondary mt-2" />
            {borrowerDropdownOpen && (
              <div className="dropdown-content flex-colum p-0 m-0">
                <li className=" p-1">
                  <Link
                    className="loan_Link text-white"
                    to="/loan/personalDetails"
                    style={{ textDecoration: "none", fontSize: "10px" }}
                  >
                    <span className="fs-4"> Personal Details </span>
                  </Link>
                </li>
                <li className=" p-1">
                  <Link
                    className="loan_Link text-white"
                    to="/loan/incomeDetails"
                    style={{ textDecoration: "none", fontSize: "10px" }}
                  >
                    <span className="fs-4">Income Details</span>
                  </Link>
                </li>
                <li className=" p-1">
                  <Link
                    className="loan_Link text-white"
                    to="/loan/employmentDetails"
                    style={{ textDecoration: "none", fontSize: "10px" }}
                  >
                    <span className="fs-4">Employment Details</span>
                  </Link>
                </li>
              </div>
            )}
          </div>

          {/* Borrower Financial Information Dropdown */}
          <div className="slide_bar" data-aos="slide-left">
            <div
              className="loan_Link  d-flex flex-colum justify-content-between bg-dark text-white p4"
              onClick={toggleFinancialDropdown}
              style={{
                textDecoration: "none",
                cursor: "pointer",
                fontSize: "10px",
              }}
            >
              Borrower Financial Information Page &#9662;
            </div>
            <hr className="text-secondary mt-2" />
            {financialDropdownOpen && (
              <div className="dropdown-content  flex-colum p-0 m-0">
                <li className="p-1">
                  <Link
                    className="loan_Link"
                    to="/loan/assetsDetails"
                    style={{ textDecoration: "none", fontSize: "10px" }}
                  >
                    <span className="fs-4"> Assets Details</span>
                  </Link>
                </li>
                <li className=" p-1">
                  <Link
                    className="loan_Link"
                    to="/loan/liabilitiesDetails"
                    style={{ textDecoration: "none", fontSize: "10px" }}
                  >
                    <span className="fs-4"> Liabilities Details</span>
                  </Link>
                </li>
              </div>
            )}
          </div>

          {/* Production Selection Tab */}
          <div className="slide_bar" data-aos="slide-left">
            <div
              className="loan_Link  d-flex flex-colum justify-content-between bg-dark text-white p4"
              onClick={toggleProductionDropdown}
              style={{
                textDecoration: "none",
                cursor: "pointer",
                fontSize: "10px",
              }}
            >
              Production Selection Page &#9662;
            </div>
            <hr className="text-secondary mt-2" />
            {productionDropdownOpen && (
              <div className="dropdown-content  flex-colum p-0 m-0">
                <li className="p-1">
                  <Link
                    className="loan_Link"
                    to="/loan/loanDetails"
                    style={{ textDecoration: "none", fontSize: "10px" }}
                  >
                    <span className="fs-4"> Loan Details </span>
                  </Link>
                </li>
                <li className=" p-1">
                  <Link
                    className="loan_Link"
                    to="/loan/loanProgram"
                    style={{ textDecoration: "none", fontSize: "10px" }}
                  >
                    <span className="fs-4"> Loan Program Options Details</span>
                  </Link>
                </li>
              </div>
            )}
          </div>

          {/* Property Information Tab */}
          <div className="slide_bar" data-aos="slide-left">
            <div
              className="loan_Link  d-flex flex-colum justify-content-between bg-dark text-white p4"
              onClick={togglePropertyInfoDropdown}
              style={{
                textDecoration: "none",
                cursor: "pointer",
                fontSize: "10px",
              }}
            >
              Property Information Page &#9662;
            </div>
            <hr className="text-secondary mt-2" />
            {propertyInfoDropdownOpen && (
              <div className="dropdown-content  flex-colum p-0 m-0">
                <li className="p-1">
                  <Link
                    className="loan_Link"
                    to="/loan/propertyInformation"
                    style={{ textDecoration: "none", fontSize: "10px" }}
                  >
                    <span className="fs-4"> Property Information Details</span>
                  </Link>
                </li>
              </div>
            )}
          </div>
          {/* Rate Locking Page Tab */}
          <div className="slide_bar" data-aos="slide-left">
            <div
              className="loan_Link d-flex flex-colum justify-content-between bg-dark text-white p4"
              onClick={toggleRateLockingDropdown}
              style={{
                textDecoration: "none",
                cursor: "pointer",
                fontSize: "10px",
              }}
            >
              Rate Locking Page &#9662;
            </div>
            <hr className="text-secondary mt-2" />
            {rateLockingDropdownOpen && (
              <div className="dropdown-content flex-colum p-0 m-0">
                <li className="p-1">
                  <Link
                    className="loan_Link"
                    to="/loan/rateLocking"
                    style={{ textDecoration: "none", fontSize: "10px" }}
                  >
                    <span className="fs-4">Rate Locking Details</span>
                  </Link>
                </li>
              </div>
            )}
          </div>

          {/* Government Monitoring on Legal Issues Dropdown */}
          <div className="slide_bar" data-aos="slide-left">
            <div
              className="loan_Link d-flex flex-colum justify-content-between bg-dark text-white p4"
              onClick={toggleGovernmentMonitoringDropdown}
              style={{
                textDecoration: "none",
                cursor: "pointer",
                fontSize: "10px",
              }}
            >
              Government Monitoring on Legal Page &#9662;
            </div>
            <hr className="text-secondary mt-2" />
            {governmentMonitoringDropdownOpen && (
              <div className="dropdown-content flex-column p-0 m-0">
                <li className="p-1">
                  <Link
                    className="loan_Link"
                    to="/loan/governmentMonitoring"
                    style={{ textDecoration: "none", fontSize: "10px" }}
                  >
                    <span className="fs-4">Government Monitoring on Legal</span>
                  </Link>
                </li>
              </div>
            )}
          </div>

          {/* Preliminary Eligibility Assessment Page Tab */}
          <div className="slide_bar" data-aos="slide-left">
            <div
              className="loan_Link d-flex flex-column justify-content-between bg-dark text-white p4"
              onClick={toggleEligibilityAssessmentDropdown}
              style={{
                textDecoration: "none",
                cursor: "pointer",
                fontSize: "10px",
              }}
            >
              Preliminary Eligibility Assessment Page &#9662;
            </div>
            <hr className="text-secondary mt-2" />
            {eligibilityAssessmentDropdownOpen && (
              <div className="dropdown-content flex-column p-0 m-0">
                <li className="p-1">
                  <Link
                    className="loan_Link"
                    to="/loan/preliminaryEligibility"
                    style={{ textDecoration: "none", fontSize: "10px" }}
                  >
                    <span className="fs-4">
                      Preliminary Eligibility Assessment Details
                    </span>
                  </Link>
                </li>
              </div>
            )}
          </div>
        </div>
        <div className="outlet">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Loans;
