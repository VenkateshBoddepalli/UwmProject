import React, { useEffect, useState } from "react";
import "./EmploymentDetails.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { FieldErrors, useForm } from "react-hook-form";

type FormValues = {
  loanId: string;
  employmentStatus: string;
  employerName: string;
  location: string;
  jobTitle: string;
  jobTenure: string;
  supervisorName: string;
  supervisorPhoneNumber: string;
  incomeFrequency: string;
  hireDate: string;
  relievingDate: string;
  income: string;
  reportedDate: string;
};

function Employmentdetails() {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    defaultValues: {
      loanId: "",
      employmentStatus: "",
      employerName: "",
      location: "",
      jobTitle: "",
      jobTenure: "",
      supervisorName: "",
      supervisorPhoneNumber: "",
      incomeFrequency: "",
      hireDate: "",
      relievingDate: "",
      income: "",
      reportedDate: "",
    },
    mode: "all",
  });

  const { register, handleSubmit, formState, trigger, getValues } = form;
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<FormValues | null>(null);
  const [borrowerList, setBorrowerList] = useState<FormValues[]>([]);
  const { errors } = formState;
  const [formData, setFormData] = useState<FormValues | null>(null);
  const [isLoanIdDisabled, setIsLoanIdDisabled] = useState(false);

  // const supervisorPhoneNumberValidation = (value: string) => {
  //   if (value === "0") {
  //     return "Phone number cannot start with zero";
  //   }
  //   return true;
  // };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoanIdDisabled(true);
      if (isEditing && editedData) {
        data.loanId = editedData.loanId;
        await axios.put(
          "http://localhost:8083/api/borrowers/employment/put/${editedData.loanId}",
          data
        );

        const updatedBorrowerList = borrowerList.map((borrower) =>
          borrower.loanId === editedData.loanId ? data : borrower
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
            "http://localhost:8083/api/borrowers/employment/put/${existingBorrower.loanId}",
            data
          );
          const updatedBorrowerList = borrowerList.map((borrower) =>
            borrower.loanId === data.loanId ? data : borrower
          );
          setBorrowerList(updatedBorrowerList);
        } else {
          // Perform a create
          const response = await axios.post(
            "http://localhost:8083/api/borrowers/employment/post",
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
    const shouldNavigate = window.confirm(
      "Do you want to go back to the previous step?"
    );
    if (shouldNavigate) {
      navigate("/loan/Incomedetails");
    } else {
      window.alert("You choose not to go back.");
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
          setFormData(parsedData);
        }
        const response = await axios.get(
          "http://localhost:8083/api/borrowers/employment/getList"
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
      await axios.post(
        "http://localhost:8083/api/borrowers/employment/saveList",
        {
          borrower: borrowerList,
        }
      );
      setBorrowerList([]);
    } catch (error) {
      console.error("Error saving borrower list:", error);
    }
  };
  const validateRelievingDate = (relievingDate: string, hireDate: string) => {
    if (!relievingDate || !hireDate) {
      return true;
    }

    const endTimestamp = new Date(relievingDate).getTime();
    const startTimestamp = new Date(hireDate).getTime();

    if (endTimestamp < startTimestamp) {
      return "End Date cannot be before Start Date";
    }
    return true;
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
        if (formData.loanId !== editedData?.loanId) {
          setIsLoanIdDisabled(true);
        }
        if (borrowerList.length > 0) {
          saveBorrowerList();
        }
        navigate("/loan/Assetsdetails");
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
      const response = await axios.get(
        `http://localhost:8083/api/borrowers/employment/get/${loanId}`
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

  const isFormComplete =
    !errors.employmentStatus &&
    !errors.employerName &&
    !errors.location &&
    !errors.jobTitle &&
    !errors.jobTenure &&
    (!errors.supervisorName || !errors.supervisorPhoneNumber) &&
    !errors.incomeFrequency &&
    !errors.hireDate &&
    !errors.relievingDate &&
    !errors.income &&
    !errors.reportedDate;

  return (
    <section className="h-100 h-custom">
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-lg-8 col-xl-6">
            <div className="card-body p-4 p-md-5">
              <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4">
                Employment Details
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
                {/* Employment Status */}
                <div className="col-md-7">
                  <label htmlFor="employmentStatus">
                    <h4>
                      Employment Status <sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <select
                    id="employmentStatus"
                    className={` select form-control-lg ${
                      errors.employmentStatus && "invalid"
                    }`}
                    {...register("employmentStatus", {
                      required: {
                        value: true,
                        message: "Employment Status is required",
                      },
                    })}
                  >
                    <option value="">Employment Status</option>
                    <option value="employed">Employed</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="selfEmployed">Self-Employed</option>
                  </select>
                  <p className="text-danger">
                    {errors.employmentStatus?.message}{" "}
                  </p>
                </div>

                {/* Employer Name */}

                <div className="col-md-7">
                  <label htmlFor="Employer Name">
                    <h4>
                      Employer Name<sup>*</sup>
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
                        message: "contain only alphabetic characters",
                      },
                      maxLength: {
                        value: 100,
                        message: "Maximum allowed length is 100",
                      },
                    })}
                  />
                  <p className="text-danger">{errors.employerName?.message}</p>
                </div>

                {/* job Title */}

                <div className="col-md-7">
                  <label htmlFor="jobTitle">
                    <h4>
                      Job Title<sup>*</sup>
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
                        message: "contain only alphabetic characters",
                      },
                      maxLength: {
                        value: 50,
                        message: "Maximum allowed length is 50",
                      },
                    })}
                    onKeyUp={() => {
                      trigger("jobTitle");
                    }}
                  />
                  <p className="text-danger">{errors.jobTitle?.message}</p>
                </div>

                {/* Location */}

                <div className="col-md-7">
                  <label htmlFor="location">
                    <h4>
                      Location<sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.location && "invalid"
                    }`}
                    type="text"
                    id="location"
                    {...register("location", {
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
                      trigger("location");
                    }}
                  />
                  <p className="text-danger">{errors.location?.message}</p>
                </div>

                {/*  Job Tenure */}

                <div className="col-md-7">
                  <label htmlFor="jobTenure">
                    <h4>Job Tenure</h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.jobTenure && "invalid"
                    }`}
                    type="text"
                    id="jobTenure"
                    {...register("jobTenure", {
                      pattern: {
                        value: /^[A-Za-z0-9\s]+$/,
                        message: "contain only alphabetic characters",
                      },
                      maxLength: {
                        value: 50,
                        message: "Maximum allowed length is 50",
                      },
                    })}
                  />
                  <p className="text-danger">{errors.jobTenure?.message}</p>
                </div>

                {/* Supervisor Name */}

                <div className="col-md-7">
                  <label htmlFor="supervisorName">
                    <h4>Supervisor Name</h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.supervisorName && "invalid"
                    }`}
                    type="text"
                    id="supervisorName"
                    {...register("supervisorName", {
                      pattern: {
                        value: /^[A-Za-z\s]+$/,
                        message: "contain only alphabetic characters",
                      },
                      maxLength: {
                        value: 100,
                        message: "Maximum allowed length is 100",
                      },
                    })}
                  />
                  <p className="text-danger">
                    {errors.supervisorName?.message}
                  </p>
                </div>

                {/*  Supervisor Phone Number */}

                <div className="col-md-7">
                  <label htmlFor="supervisorPhoneNumber">
                    <h4>Supervisor Phone Number</h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.supervisorPhoneNumber && "invalid"
                    }`}
                    type="number"
                    id="supervisorPhoneNumber"
                    {...register("supervisorPhoneNumber", {
                      valueAsNumber: true,
                      maxLength: {
                        value: 20,
                        message: "Maximum allowed length is 20",
                      },
                    })}
                  />
                  <p className="text-danger">
                    {errors.supervisorPhoneNumber?.message}
                  </p>
                </div>
                {/* Income Frequency */}

                <div className="col-md-7">
                  <label htmlFor="incomeFrequency">
                    <h4>
                      Income Frequency <sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <select
                    id="incomeFrequency"
                    className={` select form-control-lg ${
                      errors.incomeFrequency && "invalid"
                    }`}
                    {...register("incomeFrequency", {
                      required: {
                        value: true,
                        message: "Income Frequency is required",
                      },
                    })}
                  >
                    <option value="">Select Income Frequency</option>
                    <option value="monthly">Monthly</option>
                    <option value="biweekly">Biweekly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                  <p className="text-danger">
                    {errors.incomeFrequency?.message}{" "}
                  </p>
                </div>

                {/* Hire Date */}
                <div className="col-md-7">
                  <label htmlFor="hireDate">
                    <h4>
                      Hire Date<sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.hireDate && "invalid"
                    }`}
                    type="date"
                    id="hireDate"
                    {...register("hireDate", {
                      required: {
                        value: true,
                        message: "Please select a Date",
                      },
                      pattern: {
                        value: /^\d{4}-\d{2}-\d{2}$/,
                        message: "Date must be in yyyy-MM-dd format",
                      },
                      max: {
                        value: new Date().toISOString().split("T")[0],
                        message: "Hire Date cannot be in the future",
                      },
                    })}
                  />
                  <p className="text-danger">{errors.hireDate?.message}</p>
                </div>

                {/* Relieving Date */}
                <div className="col-md-7">
                  <label htmlFor="relievingDate">
                    <h4>Relieving Date</h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.relievingDate && "invalid"
                    }`}
                    type="date"
                    id="relievingDate"
                    {...register("relievingDate", {
                      validate: {
                        relievingDateValidation: (value) =>
                          validateRelievingDate(
                            value,
                            form.getValues().hireDate
                          ),
                      },
                      pattern: {
                        value: /^\d{4}-\d{2}-\d{2}$/,
                        message: "Date must be in yyyy-MM-dd format",
                      },
                      min: {
                        value: new Date().toISOString().split("T")[0],
                        message:
                          "Relieving Date must be today or a future date",
                      },
                    })}
                  />
                  <p className="text-danger">{errors.relievingDate?.message}</p>
                </div>

                {/* Income */}

                <div className="col-md-7">
                  <label htmlFor="income">
                    <h4>
                      Income <sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${errors.income && "invalid"}`}
                    type="number"
                    id="income"
                    {...register("income", {
                      valueAsNumber: true,
                      required: {
                        value: true,
                        message: "Income is Required",
                      },
                    })}
                  />
                  <p className="text-danger">{errors.income?.message}</p>
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
export default Employmentdetails;
