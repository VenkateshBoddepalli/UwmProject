import React from "react";
import Home from "./Components/Home";
// import About from './Components/About';
import Loan from "./Components/Loan";
import { Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Success from "./Components/Success";
import NotFound from "./Components/NotFound";
import Login from "./Components/Login.tsx";
import { AuthProvider } from "./Components/auth";
import Logout from "./Components/Logout";
import SignUp from "./Components/SignUp";
import PrivateRoute from "./Components/PrivateRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CreditScore from "./Components/CreditScore.js";
import Pdf from "./Components/Pdf.js";
import Cards from "./Components/Cards";
import CreditCards from "./Components/CreditCards";
import DebitCards from "./Components/DebitCards.tsx";
import PullRequest from "./Components/PullRequest.js";
import ExportPdf from "./Components/ExportPdf.js";

import PersonalDetails from "./Components/PersonalDetails/PersonalDetails.tsx";
import Employmentdetails from "./Components/EmploymentDetails/Employmentdetails.tsx";
import Incomedetails from "./Components/IncomeDetails/Incomedetails.tsx";
import Assetsdetails from "./Components/AssetsTab/Assetsdetails.tsx";
import Liabilitiesdetails from "./Components/LiabilitiesTab/Liabilitiesdetails.tsx";
import LoanDetails from "./Components/LoanDetails/LoanDetails.tsx";
import LoanProgram from "./Components/LoanProgram/LoanProgram.tsx";
import PropertyInformation from "./Components/PropertyInformation/PropertyInformation.tsx";
import RateLocking from "./Components/RateLocking/RateLocking.tsx";
import GovernmentMonitoring from "./Components/Governmentmonitoring/GovernmentMonitoring.tsx";

import PreliminaryEligibility from "./Components/PreliminaryEligibility/PreliminaryEligibility.tsx";

const LazyAbout = React.lazy(() => import("./Components/About"));

const App = () => {
  return (
    <AuthProvider className="App">
      <Navbar />
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ fontSize: "13.7px" }}
      />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/about"
          element={
            <React.Suspense fallback="Loading...">
              <LazyAbout />
            </React.Suspense>
          }
        />

        <Route
          path="/loan"
          element={
            <PrivateRoute>
              <Loan />
            </PrivateRoute>
          }
        ></Route>
        <Route path="/loan" element={<Loan />}>
          <Route path="personalDetails" element={<PersonalDetails />} />
          <Route path="incomeDetails" element={<Incomedetails />} />
          <Route path="employmentDetails" element={<Employmentdetails />} />
          <Route path="assetsDetails" element={<Assetsdetails />} />
          <Route path="liabilitiesDetails" element={<Liabilitiesdetails />} />
          <Route path="loanDetails" element={<LoanDetails />} />
          <Route path="loanProgram" element={<LoanProgram />} />
          <Route path="propertyInformation" element={<PropertyInformation />} />
          <Route path="rateLocking" element={<RateLocking />} />
          <Route
            path="governmentMonitoring"
            element={<GovernmentMonitoring />}
          />

          <Route
            path="preliminaryEligibility"
            element={<PreliminaryEligibility />}
          />
        </Route>

        <Route path="/success" element={<Success />} />

        <Route
          path="/cards"
          element={
            <PrivateRoute>
              <Cards />
            </PrivateRoute>
          }
        >
          {/* <Route index element={<NewProjects />} /> */}
          <Route path="debitCards" element={<DebitCards />} />
          <Route path="creditCards" element={<CreditCards />} />
        </Route>

        <Route
          path="/Pdf"
          element={
            <PrivateRoute>
              <Pdf />
            </PrivateRoute>
          }
        >
          <Route path="exportPdf" element={<ExportPdf />} />
        </Route>

        <Route
          path="/creditScore"
          element={
            <PrivateRoute>
              <CreditScore />
            </PrivateRoute>
          }
        >
          <Route path="pullRequest" element={<PullRequest />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
