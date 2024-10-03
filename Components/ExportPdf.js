import React, { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const ExportPdf = () => {
  const [personalInfo, setPersonalInfo] = useState([]);
  const [incomeInfo, setIncomeInfo] = useState([]);
  const [employmentRecords, setEmploymentRecords] = useState([]);
  const [assetsInfo, setAssetsInfo] = useState([]);
  const [liabilityInfo, setLiabilityInfo] = useState([]);
  const [loanDetailsInfo, setLoanDetailsInfo] = useState([]);
  const [loanProgramInfo, setLoanProgramInfo] = useState([]);
  const [propertyInfo, setPropertyInfo] = useState([]);
  const [rateLockingInfo, setRateLockingInfo] = useState([]);
  const [governmentMonitoringInfo, setGovernmentMonitoringInfo] = useState([]);
  const [preliminaryEligibilityInfo, setpreliminaryEligibilityInfo] = useState(
    []
  );

  const fetchData = async () => {
    try {
      const loanIdResponse = await axios.get("http://localhost:8081/api/uwm/getAllLoanIds");
      const latestLoanId = loanIdResponse.data[loanIdResponse.data.length - 1];

      // Use the latestLoanId to fetch details
      const [
        personalResponse,
        incomeResponse,
        employmentRecordsResponse,
        assetsResponse,
        liabilityResponse,
        loanDetailsResponse,
        loanProgramResponse,
        propertyInfoResponse,
        rateLockingResponse,
        governmentMonitoringResponse,
        preliminaryEligibilityResponse,
      ] = await Promise.all([
        axios.get(`http://localhost:8081/api/uwm/get/${latestLoanId}`),
        axios.get(`http://localhost:8082/api/borrower/get/${latestLoanId}`),
        axios.get(`http://localhost:8083/api/borrowers/employment/get/${latestLoanId}`),
        axios.get(`http://localhost:8084/api/assets/get/${latestLoanId}`),
        axios.get(`http://localhost:8085/api/liabilities/get/${latestLoanId}`),
        axios.get(`http://localhost:8086/api/loan/get/${latestLoanId}`),
        axios.get(`http://localhost:8087/api/loanprogram/get/${latestLoanId}`),
        axios.get(`http://localhost:8088/api/propinfo/get/${latestLoanId}`),
        axios.get(`http://localhost:8089/api/rateLocking/get/${latestLoanId}`),
        axios.get(`http://localhost:8090/api/gmli/get/${latestLoanId}`),
        axios.get(`http://localhost:8092/api/preEli/get/${latestLoanId}`),
      ]);

      setPersonalInfo(personalResponse.data);
      setIncomeInfo(incomeResponse.data);
      setEmploymentRecords(employmentRecordsResponse.data);
      setAssetsInfo(assetsResponse.data);
      setLiabilityInfo(liabilityResponse.data);
      setLoanDetailsInfo(loanDetailsResponse.data);
      setLoanProgramInfo(loanProgramResponse.data);
      setPropertyInfo(propertyInfoResponse.data);
      setRateLockingInfo(rateLockingResponse.data);
      setGovernmentMonitoringInfo(governmentMonitoringResponse.data);
      setpreliminaryEligibilityInfo(preliminaryEligibilityResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

 

  useEffect(() => {
    fetchData(); // Call the fetchData function when the component mounts
  }, []);

  const exportPdf = async () => {
    const doc = new jsPDF({ orientation: "landscape" });

    const addTable = (data, title) => {
      doc.addPage();
      doc.text(title, 14, 10);
      doc.autoTable({
        head: [Object.keys(data[0])], // Assuming the data array contains objects with keys
        body: data.map((item) => Object.values(item)),
      });
    };

    addTable(personalInfo, "Personal Information");
    addTable(incomeInfo, "Income Information");
    addTable(employmentRecords, "Employment Records");
    addTable(assetsInfo, "Assets Information");
    addTable(liabilityInfo, "Liability Information");
    addTable(loanDetailsInfo, "Loan Details Information");
    addTable(loanProgramInfo, "Loan Program Option");
    addTable(propertyInfo, "Property Information");
    addTable(rateLockingInfo, "RateLocking Information");
    addTable(
      governmentMonitoringInfo,
      "Government Monitoring on Illegal Information"
    );
    addTable(preliminaryEligibilityInfo, "Preliminary Eligibility Information");

    doc.save("data.pdf");
  };

  return (
    <div style={{ padding: "30px" }}>
      {/* Personal Information */}
      <h3>Personal Information</h3>
      <table className="table table-bordered" id="personal-info-table">
        <thead>
          <tr>
            <th style={{ backgroundColor: "#99FFFF" }}>Loan Id</th>
            <th style={{ backgroundColor: "#99FFFF" }}>First Name</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Last Name</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Email Address</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Date Of Birth</th>
            <th style={{ backgroundColor: "#99FFFF" }}>
              Social Security Number
            </th>
            <th style={{ backgroundColor: "#99FFFF" }}>Phone Number</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Address</th>
            <th style={{ backgroundColor: "#99FFFF" }}>City</th>
            <th style={{ backgroundColor: "#99FFFF" }}>State</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Zip Code</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Reported Date</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(personalInfo) && personalInfo.length > 0 ? (
            personalInfo.map((person, index) => (
              <tr key={index}>
                <td>{person.loanId}</td>
                <td>{person.firstName}</td>
                <td>{person.lastName}</td>
                <td>{person.emailAddress}</td>
                <td>{person.dateOfBirth}</td>
                <td>{person.socialSecurityNumber}</td>
                <td>{person.phoneNumber}</td>
                <td>{person.address}</td>
                <td>{person.city}</td>
                <td>{person.state}</td>
                <td>{person.zipCode}</td>
                <td>{person.reportedDate}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="12">No personal information available</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Income Details  */}
      <h3>Income Details</h3>
      <table className="table table-bordered" id="income-info-table">
        <thead>
          <tr>
            <th style={{ backgroundColor: "#99FFFF" }}>Loan Id</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Employment Type</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Employer Name</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Job Title</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Annual Income</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Additional Income</th>
            <th style={{ backgroundColor: "#99FFFF" }}>
              Source Of AdditionalIncome
            </th>
            <th style={{ backgroundColor: "#99FFFF" }}>Reported Date</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(incomeInfo) && incomeInfo.length > 0 ? (
            incomeInfo.map((person, index) => (
              <tr key={index}>
                <td>{person.loanId}</td>
                <td>{person.employmentType}</td>
                <td>{person.employerName}</td>
                <td>{person.jobTitle}</td>
                <td>{person.annualIncome}</td>
                <td>{person.additionalIncome}</td>
                <td>{person.sourceOfAdditionalIncome}</td>
                <td>{person.reportedDate}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">No income information available</td>
            </tr>
          )}
        </tbody>
      </table>
      {/* Employment Details  */}
      <h3>Employment Details</h3>
      <table className="table table-bordered" id="employment-records-table">
        <thead>
          <tr>
            <th style={{ backgroundColor: "#FF9966" }}>Loan Id</th>
            <th style={{ backgroundColor: "#FF9966" }}>Employment Status</th>
            <th style={{ backgroundColor: "#FF9966" }}>Employer Name</th>
            <th style={{ backgroundColor: "#FF9966" }}>Employer Name</th>
            <th style={{ backgroundColor: "#FF9966" }}>Location</th>
            <th style={{ backgroundColor: "#FF9966" }}>Job Title</th>
            <th style={{ backgroundColor: "#FF9966" }}>Job Tenure</th>
            <th style={{ backgroundColor: "#FF9966" }}>Supervisor Name</th>
            <th style={{ backgroundColor: "#FF9966" }}>
              Supervisor Phone Number
            </th>
            <th style={{ backgroundColor: "#FF9966" }}>Income Frequency</th>
            <th style={{ backgroundColor: "#FF9966" }}>Hire Date</th>
            <th style={{ backgroundColor: "#FF9966" }}>Relieving Date</th>
            <th style={{ backgroundColor: "#FF9966" }}>Income</th>
            <th style={{ backgroundColor: "#FF9966" }}>Reported Date</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(employmentRecords) && employmentRecords.length > 0 ? (
            employmentRecords.map((record, index) => (
              <tr key={index}>
                <td>{record.loanId}</td>
                <td>{record.employmentStatus}</td>
                <td>{record.employerName}</td>
                <td>{record.location}</td>
                <td>{record.jobTitle}</td>
                <td>{record.jobTenure}</td>
                <td>{record.supervisorName}</td>
                <td>{record.supervisorPhoneNumber}</td>
                <td>{record.incomeFrequency}</td>
                <td>{record.hireDate}</td>
                <td>{record.relievingDate}</td>
                <td>{record.income}</td>
                <td>{record.reportedDate}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="13">No Employment information available</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Assets Details  */}
      <h3>Assets Details</h3>
      <table className="table table-bordered" id="assets-info-table">
        <thead>
          <tr>
            <th style={{ backgroundColor: "#99FFFF" }}>Loan Id</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Asset Type</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Asset Value</th>
            <th style={{ backgroundColor: "#99FFFF" }}>
              Checking Account Balance
            </th>
            <th style={{ backgroundColor: "#99FFFF" }}>
              Savings Account Balance
            </th>
            <th style={{ backgroundColor: "#99FFFF" }}>
              Investment Account Balance
            </th>
            <th style={{ backgroundColor: "#99FFFF" }}>
              Retirement Account Balance
            </th>
            <th style={{ backgroundColor: "#99FFFF" }}>Other Assets</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Reported Date</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(assetsInfo) && assetsInfo.length > 0 ? (
            assetsInfo.map((person, index) => (
              <tr key={index}>
                <td>{person.loanId}</td>
                <td>{person.assetType}</td>
                <td>{person.assetValue}</td>
                <td>{person.checkingAccountBalance}</td>
                <td>{person.savingsAccountBalance}</td>
                <td>{person.investmentAccountBalance}</td>
                <td>{person.retirementAccountBalance}</td>
                <td>{person.otherAssets}</td>
                <td>{person.reportedDate}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9">No Assets information available</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Liability Details  */}
      <h3>Liability Details</h3>
      <table className="table table-bordered" id="liability-info-table">
        <thead>
          <tr>
            <th style={{ backgroundColor: "#99FFFF" }}>Loan Id</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Liability Type</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Liability Amount</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Credit Card Debt</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Student Loan Debt</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Car Loan Debt</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Other Loans</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Mortgage Debt</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Other Liabilities</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Reported Date</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(liabilityInfo) && liabilityInfo.length > 0 ? (
            liabilityInfo.map((person, index) => (
              <tr key={index}>
                <td>{person.loanId}</td>
                <td>{person.liabilityType}</td>
                <td>{person.liabilityAmount}</td>
                <td>{person.creditCardDebt}</td>
                <td>{person.studentLoanDebt}</td>
                <td>{person.carLoanDebt}</td>
                <td>{person.otherLoans}</td>
                <td>{person.mortgageDebt}</td>
                <td>{person.otherLiabilities}</td>
                <td>{person.reportedDate}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10">No Liabilities information available</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Loan Details  */}
      <h3>Loan Details</h3>
      <table className="table table-bordered" id="loanDetails-info-table">
        <thead>
          <tr>
            <th style={{ backgroundColor: "#99FFFF" }}>Loan Id</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Loan Amount</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Interest Rate</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Loan Term</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Loan Purpose</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Approval Status</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Reported Date</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(loanDetailsInfo) && loanDetailsInfo.length > 0 ? (
            loanDetailsInfo.map((person, index) => (
              <tr key={index}>
                <td>{person.loanId}</td>
                <td>{person.loanAmount}</td>
                <td>{person.interestRate}</td>
                <td>{person.loanTerm}</td>
                <td>{person.approvalStatus}</td>
                <td>{person.reportedDate}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No LoanDetails information available</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Loan Program Option Details  */}
      <h3>Loan Program Option Details </h3>
      <table className="table table-bordered" id="loanProgram-info-table">
        <thead>
          <tr>
            <th style={{ backgroundColor: "#99FFFF" }}>Loan Id</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Loan Program</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Interest Rate</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Loan Tenure</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Down Payment</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Processing Fee</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Reported Date</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(loanProgramInfo) && loanProgramInfo.length > 0 ? (
            loanProgramInfo.map((person, index) => (
              <tr key={index}>
                <td>{person.loanId}</td>
                <td>{person.loanProgram}</td>
                <td>{person.interestRate}</td>
                <td>{person.loanTenure}</td>
                <td>{person.downPayment}</td>
                <td>{person.processingFee}</td>
                <td>{person.reportedDate}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No loanProgram information available</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Property Information Details  */}
      <h3>Property Information </h3>
      <table className="table table-bordered" id="property-info-table">
        <thead>
          <tr>
            <th style={{ backgroundColor: "#99FFFF" }}>Loan Id</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Property Address</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Purchase Price</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Property Type</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Property Use</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Year Built</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Reported Date</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(propertyInfo) && propertyInfo.length > 0 ? (
            propertyInfo.map((person, index) => (
              <tr key={index}>
                <td>{person.loanId}</td>
                <td>{person.propertyAddress}</td>
                <td>{person.purchasePrice}</td>
                <td>{person.propertyType}</td>
                <td>{person.propertyUse}</td>
                <td>{person.yearBuilt}</td>
                <td>{person.reportedDate}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No property information available</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* RateLocking Information Details  */}
      <h3>RateLocking Information </h3>
      <table className="table table-bordered" id="rateLocking-info-table">
        <thead>
          <tr>
            <th style={{ backgroundColor: "#99FFFF" }}>Loan Id</th>
            <th style={{ backgroundColor: "#99FFFF" }}>RateLockPeriod</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Expiration Date</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Interest Rate</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Reported Date</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(rateLockingInfo) && rateLockingInfo.length > 0 ? (
            rateLockingInfo.map((person, index) => (
              <tr key={index}>
                <td>{person.loanId}</td>
                <td>{person.rateLockPeriod}</td>
                <td>{person.expirationDate}</td>
                <td>{person.interestRate}</td>
                <td>{person.reportedDate}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No RateLocking information available</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Government Monitoring on Illegal Details  */}
      <h3>Government Monitoring on Illegal Details </h3>
      <table
        className="table table-bordered"
        id="governmentMonitoring-info-table"
      >
        <thead>
          <tr>
            <th style={{ backgroundColor: "#99FFFF" }}>Loan Id</th>
            <th style={{ backgroundColor: "#99FFFF" }}>
              Social Security Number
            </th>
            <th style={{ backgroundColor: "#99FFFF" }}>Date Of Birth</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Ethnicity</th>
            <th style={{ backgroundColor: "#99FFFF" }}>race</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Reported Date</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(governmentMonitoringInfo) &&
          governmentMonitoringInfo.length > 0 ? (
            governmentMonitoringInfo.map((person, index) => (
              <tr key={index}>
                <td>{person.loanId}</td>
                <td>{person.socialSecurityNumber}</td>
                <td>{person.dateOfBirth}</td>
                <td>{person.ethnicity}</td>
                <td>{person.race}</td>
                <td>{person.reportedDate}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No governmentMonitoring information available</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Preliminary Eligilibilty Details  */}
      <h3>Preliminary Eligilibilty Details </h3>
      <table
        className="table table-bordered"
        id="preliminaryEligibility-info-table"
      >
        <thead>
          <tr>
            <th style={{ backgroundColor: "#99FFFF" }}>Loan Id</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Annual Income</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Employment Status</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Property Type</th>
            <th style={{ backgroundColor: "#99FFFF" }}>Reported Date</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(preliminaryEligibilityInfo) &&
          preliminaryEligibilityInfo.length > 0 ? (
            preliminaryEligibilityInfo.map((person, index) => (
              <tr key={index}>
                <td>{person.loanId}</td>
                <td>{person.annualIncome}</td>
                <td>{person.employmentStatus}</td>
                <td>{person.propertyType}</td>
                <td>{person.reportedDate}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">
                No preliminaryEligibility information available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <button
        className="btn btn-primary float-end mt-2 mb-2"
        onClick={exportPdf}
      >
        Download PDF
      </button>
    </div>
  );
};

export default ExportPdf;
