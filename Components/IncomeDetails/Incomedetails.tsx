import React, { useEffect, useState } from "react";
import "./IncomeDetails.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { FieldErrors, useForm } from "react-hook-form";

type FormValues = {
  loanId: string;
  employmentType: string;
  employerName: string;
  jobTitle: string;
  annualIncome: string;
  additionalIncome: string;
  sourceOfAdditionalIncome: string;
  reportedDate: string;
};

function Incomedetails() {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    defaultValues: {
      loanId:"",
      employmentType: "",
      employerName: "",
      jobTitle: "",
      annualIncome: "",
      additionalIncome: "",
      sourceOfAdditionalIncome: "",
      reportedDate: "",
    },
    mode: "all",
  });

  const validateNonNegative = (value: string) => {
    if (parseFloat(value) < 0) {
      return "Value cannot be negative";
    }
    return true;
  };

  const { register, handleSubmit, getValues, formState, trigger, watch } = form;
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<FormValues | null>(null);
  const [borrowerList, setBorrowerList] = useState<FormValues[]>([]);
  const { errors } = formState;
  const [formData, setFormData] = useState<FormValues | null>(null);
  const [isLoanIdDisabled,setIsLoanIdDisabled] = useState(false);

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoanIdDisabled(true);
      if (isEditing && editedData) {
        data.loanId = editedData.loanId;
        await axios.put(
          "http://localhost:8082/api/borrower/put/${editedData.loanId}",
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
            "http://localhost:8082/api/borrower/put/${existingBorrower.loanId}",
            data
          );
          const updatedBorrowerList = borrowerList.map((borrower) =>
            borrower.loanId === data.loanId ? data : borrower
          );
          setBorrowerList(updatedBorrowerList);
      } else {
        // Perform a create
        const response = await axios.post(
          "http://localhost:8082/api/borrower/add",
          data
        );
        if (!data.loanId) {
          data.loanId = response.data.loanId;
        }
        const newBorrower = { ...data };
          setBorrowerList([...borrowerList, newBorrower]);
        }
      }
      setFormData(data);
      localStorage.removeItem("formData");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const onError = (errors: FieldErrors<FormValues>) => {
    console.log("Form errors", errors);
  };

  const goToPreviousStep = () => {
    // form.reset();
    const shouldNavigate = window.confirm(
      "Do you want to go back to the previous step?"
    );
    if (shouldNavigate) {
      navigate("/loan/PersonalDetails");
    } else {
      window.alert("You chose not to go back.");
    }
  };

  const onSave = async () => {
    const isValid = await trigger();
    if (isValid) {
      const formData = form.getValues();
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const savedFormData = localStorage.getItem("formData");
        if (savedFormData !== null) {
          const parsedData = JSON.parse(savedFormData);
          form.reset(parsedData);
          //setFormData(parsedData);
        }

        const response = await axios.get(
          "http://localhost:8082/api/borrower/getList"
        );
        setBorrowerList(response.data);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    fetchData();
  }, [form]);

  const onEdit = (borrower: FormValues) => {
    setIsEditing(true);
    setEditedData(borrower);
   setIsLoanIdDisabled(true);
  };

  const saveBorrowerList = async () => {
    try {
      await axios.post("http://localhost:8082/api/borrower/saveList", {
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
      setEditedData(formData);
      localStorage.setItem("formData", JSON.stringify(formData));
      console.log("Form data saved:", formData);
      console.log("Form is valid, navigating...");
      const shouldNavigate = window.confirm(
        "Form is valid. Do you want to proceed to the next step?"
      );
      if (shouldNavigate) {
        if(formData.loanId!==editedData?.loanId){
          setIsLoanIdDisabled(true);
        }
        if (borrowerList.length > 0) {
          saveBorrowerList();
        }
        navigate("/loan/Employmentdetails");
      } else {
        console.log("User chose not to proceed.");
      }
    } else {
      console.log("Form is not complete, cannot proceed to next.");
      window.alert("Form is not complete. Please fill in all required fields.");
    }
  };
  const fetchBorrowerDataByLoanId = async (loanId: string) => {
    try {
      const response = await axios.get(`http://localhost:8082/api/borrower/get/${loanId}`);
      const borrowerData = response.data;
      form.reset({
        ...borrowerData,
        loanId: loanId,
      });
    } catch (error) {
      console.log("Error fetching data by loan Id:", error);
    }
  };
  const isFormComplete =
    !errors.loanId &&
    !errors.employmentType &&
    !errors.employerName &&
    !errors.jobTitle &&
    !errors.annualIncome &&
    !errors.additionalIncome &&
    !errors.sourceOfAdditionalIncome &&
    !errors.reportedDate;

  return (
    <section className="h-100 h-custom">
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-lg-8 col-xl-6">
            <div className="card-body p-4 p-md-5 ">
              <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4">
                Income Details
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
                    onChange={(e) => {
                      const enteredLoanId = e.target.value;
                      fetchBorrowerDataByLoanId(enteredLoanId);
                    }}
                  />
                  {!isLoanIdDisabled && errors.loanId && (
                    <p className="text-danger">{errors.loanId?.message}</p>
                  )}
                </div>
                {/* Employment Type */}
                <div className="col-md-7">
                  <label htmlFor="employmentType">
                    <h4>
                      Employment Type <sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <select
                    id="employmentType"
                    className={`select form-control-lg ${
                      errors.employmentType && "invalid"
                    }`}
                    {...register("employmentType", {
                      required: {
                        value: true,
                        message: "Employment Type is required",
                      },
                    })}
                  >
                    <option value="">Employment Type</option>
                    <option value="Full-time Employees">
                      Full-time Employees
                    </option>
                    <option value="Part-time Employees">
                      Part-time Employees
                    </option>
                    <option value="Employment Contract">
                      Employment Contract
                    </option>
                  </select>
                  <p className="text-danger">
                    {errors.employmentType?.message}{" "}
                  </p>
                </div>

                {/* Employer Name */}
                <div className="col-md-7">
                  <label htmlFor="employerName">
                    <h4>
                      Employer Name <sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.employerName && "invalid"
                    }`}
                    type="text"
                    id="employerName"
                    {...register("employerName", {
                      required: {
                        value: true,
                        message: "Employer Name is required",
                      },
                      pattern: {
                        value: /^[A-Za-z\s]+$/,
                        message: "Should contain only alphabetic characters",
                      },
                      maxLength: {
                        value: 100,
                        message: "Cannot exceed 100 characters",
                      },
                    })}
                  />
                  <p className="text-danger">{errors.employerName?.message}</p>
                </div>

                {/* Job Title */}
                <div className="col-md-7">
                  <label htmlFor="jobTitle">
                    <h4>
                      Job Title <sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.jobTitle && "invalid"
                    }`}
                    type="text"
                    id="jobTitle"
                    {...register("jobTitle", {
                      required: {
                        value: true,
                        message: "Job Title is required",
                      },
                      pattern: {
                        value: /^[A-Za-z\s]+$/,
                        message: "Should contain only alphabetic characters",
                      },
                      maxLength: {
                        value: 50,
                        message: "Cannot exceed 50 characters",
                      },
                    })}
                  />
                  <p className="text-danger">{errors.jobTitle?.message}</p>
                </div>

                {/* Annual Income */}
                <div className="col-md-7">
                  <label htmlFor="annualIncome">
                    <h4>
                      Annual Income <sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.annualIncome && "invalid"
                    }`}
                    type="number"
                    id="annualIncome"
                    {...register("annualIncome", {
                      valueAsNumber: true,
                      validate: {
                        nonNegativeValidation: validateNonNegative,
                      },
                      required: {
                        value: true,
                        message: "AnnualIncome is required",
                      },
                    })}
                    onKeyUp={() => {
                      trigger("annualIncome");
                    }}
                  />
                  <p className="text-danger">
                    {errors.annualIncome?.message}
                  </p>
                </div>

                {/* Additional Income */}
                <div className="col-md-7">
                  <label htmlFor="additionalIncome">
                    <h4>Additional Income</h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.additionalIncome && "invalid"
                    }`}
                    type="number"
                    id="additionalIncome"
                    {...register("additionalIncome", {
                      valueAsNumber: true,
                      validate: {
                        nonNegativeValidation: validateNonNegative,
                      },
                    })}
                    onKeyUp={() => {
                      trigger("additionalIncome");
                    }}
                  />
                  <p className="text-danger">
                    {errors.additionalIncome?.message}
                  </p>
                </div>

                {/* Source of Additional Income */}
                <div className="col-md-7">
                  <label htmlFor="sourceOfAdditionalIncome">
                    <h4>Source of Additional Income</h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.sourceOfAdditionalIncome && "invalid"
                    }`}
                    type="text"
                    id="sourceOfAdditionalIncome"
                    {...register("sourceOfAdditionalIncome", {
                      disabled: !watch("additionalIncome"),
                      pattern: {
                        value: /^[A-Za-z\s]+$/,
                        message: "Should contain only alphabetic characters",
                      },
                      maxLength: {
                        value: 100,
                        message: "Cannot exceed 100 characters",
                      },
                    })}
                  />
                  <p className="text-danger">
                    {errors.sourceOfAdditionalIncome?.message}
                  </p>
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
                    className="button3 btn btn-info btn-lg mb-1"
                    onClick={goToPreviousStep}
                  >
                    Prev
                  </button>
                  <button
                    type="submit"
                    className="button1 btn btn-info btn-lg mb-1"
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
                    className="button2 btn btn-info btn-lg mb-1"
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

export default Incomedetails;