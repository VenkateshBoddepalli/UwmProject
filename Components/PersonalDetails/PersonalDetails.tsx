import React, { useEffect, useState } from "react";
import Statesdatadetails from "./Statesdatadetails";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Personaldetails.css";
import axios from "axios";
import { FieldErrors, useForm } from "react-hook-form";

type FormValues = {
  loanId: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  dateOfBirth: string;
  socialSecurityNumber: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  reportedDate: string;
};

function PersonalDetails() {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    defaultValues: {
      loanId: "",
      firstName: "",
      lastName: "",
      emailAddress: "",
      dateOfBirth: "",
      socialSecurityNumber: "",
      phoneNumber: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      reportedDate: "",
    },
    mode: "all",
  });
  const [state, setState] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<FormValues | null>(null);
  const [borrowerList, setBorrowerList] = useState<FormValues[]>([]);
  const { register, handleSubmit, formState, trigger, getValues } = form;
  const { errors } = formState;
  const [formData, setFormData] = useState<FormValues | null>(null);
  const [isLoanIdDisabled, setIsLoanIdDisabled] = useState(false);
  const [nextLoanId, setNextLoanId] = useState("");

  const onSubmit = async (data: FormValues) => {
  try {
    data.state = state;
    console.log("Form Data:", data);
    console.log("Form submitted successfully");
    setIsLoanIdDisabled(true);

    if (isEditing && editedData) {
      data.loanId = editedData.loanId;
      await axios.put(
        `http://localhost:8081/api/uwm/put/${editedData.loanId}`,
        data
      );
       // Update the borrowerList state
       const updatedBorrowerList = borrowerList.map((borrower) =>
       borrower.loanId === data.loanId ? data : borrower
     );
     setBorrowerList(updatedBorrowerList);
     setIsEditing(false);
     setEditedData(null);
    } else {
      const existingBorrower = borrowerList.find(
        (borrower) => borrower.loanId === data.loanId
      );

      if (existingBorrower) {
        data.loanId = existingBorrower.loanId;
        await axios.put(
          `http://localhost:8081/api/uwm/put/${existingBorrower.loanId}`,
          data
        );
        const updatedBorrowerList = borrowerList.map((borrower) =>
        borrower.loanId === data.loanId ? data : borrower
      );
      setBorrowerList(updatedBorrowerList);
      } else {
        const response = await axios.post(
          "http://localhost:8081/api/uwm/add",
          data
        );

        if (!data.loanId) {
          data.loanId = response.data.loanId;
        }
        const newBorrower = { ...data };
        setBorrowerList([...borrowerList, newBorrower]);
      }
      setFormData(data);
      localStorage.removeItem("formData");
    }
  } catch (error) {
    if (error.response) {
      // The request was made, but the server responded with a status code other than 2xx.
      console.error("Request failed with status code:", error.response.status);
      console.error("Response data:", error.response.data);
    } else if (error.request) {
      // The request was made, but no response was received (e.g., network error).
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an error.
      console.error("Error setting up the request:", error.message);
    }

    // You might want to add error handling or display an error message here.
  }
};

  

  const onError = (errors: FieldErrors<FormValues>) => {
    console.log("Form errors", errors);
  };

  const onStateSelect = (stateValue: string) => {
    setState(stateValue);
  };

  const onSave = async () => {
    const isValid = await trigger();
    if (isValid) {
      const formData = form.getValues();
      formData.state = state;
      setEditedData(formData);
      localStorage.setItem("formData", JSON.stringify(formData));
      console.log("Form data saved:", getValues());
      toast.success("Form data saved successfully", {
        position: toast.POSITION.TOP_RIGHT,
      });
    } else {
      window.alert("Form is not complete, cannot save.");
    }
  };

  const isFormComplete = !Object.keys(errors).length && !!state;

  useEffect(() => {
    const fetchNextLoanId = async () => {
      try {
        const savedFormData = localStorage.getItem("formData");
        if (savedFormData !== null) {
          const parsedData = JSON.parse(savedFormData);
          form.reset(parsedData);
          setFormData(parsedData);
        }

        const response = await axios.get("http://localhost:8081/api/uwm/get/nextLoanId");
        setNextLoanId(response.data);
      } catch (error) {
        console.error("Error fetching next loanId:", error);
      }
    };
    fetchNextLoanId();
  }, []);


  const onEdit = (borrower: FormValues) => {
    setIsEditing(true);
    setEditedData(borrower);
    setIsLoanIdDisabled(true);
  };

  const saveBorrowerList = async () => {
    try {
      await axios.post("http://localhost:8081/api/uwm/saveList", {
        borrowers: borrowerList,
      });
      setBorrowerList([]);
    } catch (error) {
      console.error("Error saving borrower list:", error);
    }
  };

  const onNext = async () => {
    console.log("Next button clicked");
    const isValid = await trigger();
    if (isValid && isFormComplete) {
      const formData = form.getValues();
      formData.state = state;
      setEditedData(formData);
      localStorage.setItem("formData", JSON.stringify(formData));
      console.log("Form data saved:", formData);
      console.log("Form is valid, navigating...");
      const shouldNavigate = window.confirm(
        "Form is valid. Do you want to proceed to the next step?"
      );
      if (shouldNavigate) {
        if (formData.loanId !== editedData?.loanId) {
          setIsLoanIdDisabled(true);
        }
        if (borrowerList.length > 0) {
          saveBorrowerList();
        }
        navigate("/loan/Incomedetails");
      } else {
        console.log("User chose not to proceed.");
      }
    } else {
      console.log("Form is not complete or state is not selected.");
      if (!state) {
        window.alert("Please select a state.");
      } else {
        window.alert(
          "Form is not complete. Please fill in all required fields."
        );
      }
    }
  };

  const fetchBorrowerDataByLoanId = async (loanId: string) => {
    try {
      const response = await axios.get(
        `http://localhost:8081/api/uwm/get/${loanId}`
      );
      const borrowerData = response.data;
      form.reset({
        ...borrowerData,
        loanId: loanId,
      });
    } catch (error) {
      console.log("Error fetching data by loan Id:", error);
    }
  };

  return (
    <section className="h-100 h-custom">
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-lg-8 col-xl-6">
            <div className="card-body p-4 p-md-5">
              <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4">
                Personal Details
              </p>

              <form
                className="px-md-2"
                onSubmit={handleSubmit(onSubmit, onError)}
                noValidate
              >
                {/*  Loan Id */}

                <div className="col-md-7">
                  <label htmlFor="loanId">
                    <h4>
                      Loan Id <sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      (errors.loanId || isLoanIdDisabled) && "invalid"
                    }`}
                    type="text"
                    id="loanId"
                    {...register("loanId", {
                      required: {
                        value: true,
                        message: "Loan Id is required",
                      },
                      pattern: {
                        value: /^[A-Za-z0-9\s]+$/,
                        message: "contain only alphabetic characters",
                      },
                      maxLength: {
                        value: 50,
                        message: "Maximum allowed length is 50",
                      },
                    })}
                    onKeyUp={() => {
                      trigger("loanId");
                    }}
                    disabled={isLoanIdDisabled}
                    value={nextLoanId}
                    onChange={(e) => {
                      const enteredLoanId = e.target.value;
                      fetchBorrowerDataByLoanId(enteredLoanId);
                    }}
                  />
                  {!isLoanIdDisabled && errors.loanId && (
                    <p className="text-danger">{errors.loanId?.message}</p>
                  )}
                </div>
                {/*  First Name */}

                <div className="col-md-7">
                  <label htmlFor="firstName">
                    <h4>
                      First Name<sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.firstName && "invalid"
                    }`}
                    type="text"
                    id="firstName"
                    {...register("firstName", {
                      required: {
                        value: true,
                        message: "First Name is required",
                      },
                      pattern: {
                        value: /^[A-Za-z\s]+$/,
                        message: "contain only alphabetic characters",
                      },
                      maxLength: {
                        value: 50,
                        message: "Maximum allowed length is 50",
                      },
                    })}
                    onKeyUp={() => {
                      trigger("firstName");
                    }}
                  />
                  <p className="text-danger">{errors.firstName?.message}</p>
                </div>

                {/*  Last Name */}

                <div className="col-md-7">
                  <label htmlFor="lastName">
                    <h4>
                      Last Name<sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.lastName && "invalid"
                    }`}
                    type="text"
                    id="lastName"
                    {...register("lastName", {
                      required: {
                        value: true,
                        message: "Last Name is required",
                      },
                      pattern: {
                        value: /^[A-Za-z\s]+$/,
                        message: "contain only alphabetic characters",
                      },
                      maxLength: {
                        value: 50,
                        message: "Maximum allowed length is 50",
                      },
                    })}
                    onKeyUp={() => {
                      trigger("lastName");
                    }}
                  />
                  <p className="text-danger">{errors.lastName?.message}</p>
                </div>

                {/* Email Address */}

                <div className="col-md-7">
                  <label htmlFor="emailAddress">
                    <h4>
                      Email Address<sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.emailAddress && "invalid"
                    }`}
                    type="text"
                    id="emailAddress"
                    {...register("emailAddress", {
                      required: "Email Address is Required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                      maxLength: {
                        value: 100,
                        message: "Maximum allowed length is 100",
                      },
                    })}
                    onKeyUp={() => {
                      trigger("emailAddress");
                    }}
                  />
                  <p className="text-danger">{errors.emailAddress?.message}</p>
                </div>

                {/* Date Of Birth */}
                <div className="col-md-7">
                  <label htmlFor="dateOfBirth">
                    <h4>
                      Date Of Birth<sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.dateOfBirth && "invalid"
                    }`}
                    type="date"
                    id="dob"
                    {...register("dateOfBirth", {
                      required: "Date of Birth is required",
                      pattern: {
                        value: /^\d{4}-\d{2}-\d{2}$/,
                        message: "Date must be in yyyy-MM-dd format",
                      },
                      validate: (value) => {
                        const dob = new Date(value);
                        const minDate = new Date("1900-01-01");
                        const maxDate = new Date(); // Current Date
                        maxDate.setFullYear(maxDate.getFullYear() - 18); // 18 years ago

                        if (dob > maxDate) {
                          return "You must be at least 18 years old.";
                        }
                        if (dob < minDate) {
                          return "Date of Birth cannot be earlier than 1900-01-01.";
                        }
                        return true;
                      },
                    })}
                  />
                  <p className="text-danger">{errors.dateOfBirth?.message}</p>
                </div>

                {/*  Social Security Number */}

                <div className="col-md-7">
                  <label htmlFor="socialSecurityNumber">
                    <h4>
                      Social Security Number (SSN)<sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.socialSecurityNumber && "invalid"
                    }`}
                    type="text"
                    id="ssn"
                    maxLength={9}
                    {...register("socialSecurityNumber", {
                      required: "Social Security Number (SSN) is required",
                      pattern: {
                        value: /^\d{9}$/,
                        message: "SSN must be in xxxxxxxxx format",
                      },
                    })}
                  />
                  <p className="text-danger">
                    {errors.socialSecurityNumber?.message}
                  </p>
                </div>

                {/*  Phone Number */}

                <div className="col-md-7">
                  <label htmlFor="phoneNumber">
                    <h4>
                      Phone Number<sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.phoneNumber && "invalid"
                    }`}
                    type="number"
                    id="phoneNumber"
                    maxLength={20}
                    {...register("phoneNumber", {
                      required: {
                        value: true,
                        message: "Phone Number is Required",
                      },
                      pattern: {
                        value: /^\d{0,20}$/,
                        message: "Invalid Phone Number",
                      },
                    })}
                    onKeyUp={() => {
                      trigger("phoneNumber");
                    }}
                  />
                  <p className="text-danger">{errors.phoneNumber?.message}</p>
                </div>

                {/* Address */}

                <div className="col-md-7">
                  <label htmlFor="address">
                    <h4>
                      Address<sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${errors.address && "invalid"}`}
                    type="text"
                    id="address"
                    {...register("address", {
                      required: {
                        value: true,
                        message: "Address is required",
                      },
                      maxLength: {
                        value: 200,
                        message: "Maximum allowed length is 200",
                      },
                    })}
                    onKeyUp={() => {
                      trigger("address");
                    }}
                  />
                  <p className="text-danger">{errors.address?.message}</p>
                </div>

                {/* City*/}

                <div className="col-md-7">
                  <label htmlFor="city">
                    <h4>
                      City<sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${errors.city && "invalid"}`}
                    type="text"
                    id="city"
                    {...register("city", {
                      required: {
                        value: true,
                        message: "City is required",
                      },
                      pattern: {
                        value: /^[A-Za-z]+$/,
                        message: "contain only alphabetic characters",
                      },
                      maxLength: {
                        value: 100,
                        message: "City cannot exceed 100 characters",
                      },
                    })}
                    onKeyUp={() => {
                      trigger("city");
                    }}
                  />
                  <p className="text-danger">{errors.city?.message}</p>
                </div>

                <div className="form-row1">
                  <Statesdatadetails onStateSelect={onStateSelect} />
                  {!state && (
                    <span className="text-danger">{errors.state?.message}</span>
                  )}
                </div>

                {/* Zip Code */}

                <div className="col-md-7">
                  <label htmlFor="zipCode">
                    <h4>
                      Zip Code<sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${errors.zipCode && "invalid"}`}
                    type="number"
                    id="zipCode"
                    maxLength={5}
                    {...register("zipCode", {
                      required: {
                        value: true,
                        message: "Zip Code is Required",
                      },
                      pattern: {
                        value: /^\d{5}$/,
                        message: "Invalid Zip Code",
                      },
                    })}
                    onKeyUp={() => {
                      trigger("zipCode");
                    }}
                  />
                  <p className="text-danger">{errors.zipCode?.message}</p>
                </div>

                {/* Reported Date*/}

                <div className="col-md-7">
                  <label htmlFor="reportedDate">
                    <h4>
                      Reported Date<sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.reportedDate && "invalid"
                    }`}
                    type="date"
                    id="reportedDate"
                    {...register("reportedDate", {
                      required: {
                        value: true,
                        message: "Please select a Date",
                      },
                      pattern: {
                        value: /^\d{4}-\d{2}-\d{2}$/,
                        message: "Date must be in yyyy-MM-dd format",
                      },
                    })}
                    value={new Date().toISOString().split("T")[0]}
                  />
                  <p className="text-danger">{errors.reportedDate?.message}</p>
                </div>
                <br />
                <div className="buttons">
                  <button
                    type="submit"
                    className="button1 btn btn-info btn-lg  mb-1"
                    onClick={onSave}
                  >
                    Save
                  </button>

                  <button
                    type="submit"
                    className="button2 btn btn-info btn-lg mb-1"
                    onClick={() => onEdit(borrowerList[0])}
                  >
                    Edit
                  </button>

                  <button
                    type="submit"
                    className="button2 btn btn-info btn-lg  mb-1"
                    onClick={onNext}
                    disabled={!isFormComplete}
                  >
                    Next
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default PersonalDetails;
