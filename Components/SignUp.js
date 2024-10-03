import React, { useState } from "react";
import { useAuth } from "./auth";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./mystyle.module.css";

function SignUp() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("null");
  const navigate = useNavigate();

  const userName = localStorage.getItem("email")
    ? localStorage.getItem("email")
    : "Venkateshboddepalli1999@gmail.com";
  const userPassword = localStorage.getItem("password")
    ? localStorage.getItem("password")
    : "Venkey@123";
  const ConfirmUserPassword = localStorage.getItem("confirmPassword")
    ? localStorage.getItem("confirmPassword")
    : "Venkey@123";

  const handleSubmit = (e) => {
    e.preventDefault();
// toast.error("Incorrect Email & Password");
    if (email != userName) {
      toast.error("Enter Correct Email");
      login(email);
    } else if (email != userName) {
      toast.info("Enter Password");
    } else if (password != userPassword) {
      toast.info("Enter Correct password");
      login(password);
    } else if (confirmPassword != ConfirmUserPassword) {
      toast.info("Enter Correct confirm Password");
    } else if (confirmPassword === ConfirmUserPassword) {
      toast.success("Register Success");
      navigate("/login");
      login(email);
    }

    //  alert('Form submitted successfully!');
    //  else if (password === userPassword) {
    //   toast.info("Enter confirm Password");
    //  }

    // if (email === userName && password === userPassword && confirmPassword === ConfirmUserPassword) {
    //   toast.success("Register Success");
    //   navigate("/login");
    //   login(email)
    // } else {
    //   toast.error("Invalid confirm Password & Email");
    // }
  };
  return (
    <div className="sign">
      <div className="Container">
        <form className="main-form" onSubmit={handleSubmit}>
          <h2 className="h2_class">Register</h2>
          <p>Please fill in this form to create an account</p>
          <br />

          <div className="form-group">
            <label htmlFor="email" className="Signup_lable" >
              <b>Email:</b>
              <i class="fa-solid fa-envelope fa-flip"></i>
            </label>
            <input
              type="text"
              name="email"
              className="form-control"
              id="email"
              value={email}
              placeholder="Enter Email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {/* {
                    error?.status === "email" &&(<span>{error.message}</span>)
               } */}
            <div />

            <div class="form-group">
              <label for="password" className="Signup_lable">
                <b>Password:</b>
                <i class="fa-solid fa-lock fa-flip"></i>
              </label>
              <br />
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                placeholder="Enter password"
                id="password"
                required
              />
              {/* {
                   error?.status === "password" &&(<span>{error.message}</span>)
                   } */}
              {/* <div className="text-danger">{error.password}</div> */}
            </div>
            <br />

            <div class="form-group">
              <label for="password" className="Signup_lable">
                <b>Confirm Password:</b>
                <i class="fa-solid fa-square-check fa-flip"></i>
              </label>
              <br />
              <input
                type="password"
                name="confirm_password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                class="form-control"
                placeholder="Enter confirm password"
                id="confirm_password"
                required
              />
              {/* {
                    error?.status === "confirmPassword" &&(<span>{error.message}</span>)
                   } */}
            </div>
            <br />

            <p>
              <b>By creating an account you agree to our</b>{" "}
              <a className="Signup_a" href="#">Terms & Privacy</a>.
            </p>
            <br />

            <button
              className="Signup_button"
              type="submit"
              value="Submit"
              // className="btn btn-success submit_btn"
              onClick={handleSubmit}
            >
              Register
            </button>

            <div className="container_signin">
              <p className="Signup_para">
                Already have an account? <a href="/login">Login in</a>.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
