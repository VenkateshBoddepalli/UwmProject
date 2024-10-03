import React, { useState, useEffect } from "react";
import "./LoanDetails.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { FieldErrors, useForm } from "react-hook-form";

type FormValues = {
  loanId: string;
  loanAmount: string;
  interestRate: string;
  loanTerm: string;
  loanPurpose: string;
  approvalStatus: string;
  reportedDate: string;
};

function LoanDetails() {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    defaultValues: {
      loanId: "",
      loanAmount: "",
      interestRate: "",
      loanTerm: "",
      loanPurpose: "",
      approvalStatus: "",
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

  const { register, handleSubmit, formState, trigger, getValues } = form;
  const { errors } = formState;
  const [formData, setFormData] = useState<FormValues | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<FormValues | null>(null);
  const [borrowerList, setBorrowerList] = useState<FormValues[]>([]);
  const [isLoanIdDisabled, setIsLoanIdDisabled] = useState(false);

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoanIdDisabled(true);
      if (isEditing && editedData) {
        data.loanId = editedData.loanId;
        await axios.put(
          `http://localhost:8086/api/loan/put/${editedData.loanId}`,
          data
        );

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
            `http://localhost:8086/api/loan/put/${existingBorrower.loanId}`,
            data
          );
          const updatedBorrowerList = borrowerList.map((borrower) =>
            borrower.loanId === data.loanId ? data : borrower
          );
          setBorrowerList(updatedBorrowerList);
        } else {
          // Perform a create
          const response = await axios.post(
            "http://localhost:8086/api/loan/add",
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
      navigate("/loan/Liabilitiesdetails");
    } else {
      console.log("User chose not to go back.");
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
      console.log("Form is not complete, cannot save.");
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
          "http://localhost:8086/api/loan/getList"
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
      await axios.post("http://localhost:8086/api/loan/saveList", {
        borrower: borrowerList,
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
        if (formData.loanId !== editedData?.loanId) {
          setIsLoanIdDisabled(true);
        }
        if (borrowerList.length > 0) {
          saveBorrowerList();
        }
        navigate("/loan/LoanProgram");
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
        `http://localhost:8086/api/loan/get/${loanId}`
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
    !errors.loanId &&
    !errors.loanAmount &&
    !errors.interestRate &&
    !errors.loanTerm &&
    !errors.loanPurpose &&
    !errors.approvalStatus &&
    !errors.reportedDate;

  const validateInteger = (value) => {
    if (Number.isNaN(value) || !Number.isInteger(value)) {
      return "Please enter an integer value.";
    }
    return true;
  };

  return (
    <section className="h-100 h-custom">
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-lg-8 col-xl-6">
            <div className="card-body p-4 p-md-5">
              <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 ">
                Loan Details
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
                {/* Loan Amount */}
                <div className="col-md-7">
                  <label htmlFor="loanAmount">
                    <h4>
                      Loan Amount<sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.loanAmount && "invalid"
                    }`}
                    type="number"
                    id="loanAmount"
                    {...register("loanAmount", {
                      valueAsNumber: true,
                      required: {
                        value: true,
                        message: "Loan Amount is required",
                      },
                      validate: {
                        nonNegativeValidation: validateNonNegative,
                      },
                    })}
                    onKeyUp={() => {
                      trigger("loanAmount");
                    }}
                  />
                  <p className="text-danger">{errors.loanAmount?.message}</p>
                </div>

                {/* Interest Rate */}
                <div className="col-md-7">
                  <label htmlFor="interestRate">
                    <h4>
                      Interest Rate (%)<sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.interestRate && "invalid"
                    }`}
                    type="number"
                    id="interestRate"
                    {...register("interestRate", {
                      valueAsNumber: true,
                      required: {
                        value: true,
                        message: "Interest Rate is required",
                      },
                      validate: {
                        nonNegativeValidation: validateNonNegative,
                      },
                    })}
                    onKeyUp={() => {
                      trigger("interestRate");
                    }}
                    placeholder="%"
                  />
                  <p className="text-danger">{errors.interestRate?.message}</p>
                </div>

                {/* Loan Term */}
                <div className="col-md-7">
                  <label htmlFor="loanTerm">
                    <h4>
                      Loan Term <sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.loanTerm && "invalid"
                    }`}
                    type="text"
                    id="loanTerm"
                    {...register("loanTerm", {
                      required: "Loan Term is required",
                      pattern: {
                        value: /^\d+$/, // Use a regular expression to only allow digits
                        message: "Enter a valid integer (no decimals)",
                      },
                      min: {
                        value: 1,
                        message: "Minimum value is 1",
                      },
                    })}
                    onKeyUp={() => {
                      trigger("loanTerm");
                    }}
                    placeholder="years"
                  />
                  <p className="text-danger">{errors.loanTerm?.message}</p>
                </div>

                {/* Loan Purpose */}
                <div className="col-md-7">
                  <label htmlFor="loanPurpose">
                    <h4>
                      Loan Purpose <sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <select
                    id="loanPurpose"
                    className={`select form-control-lg ${
                      errors.loanPurpose && "invalid"
                    }`}
                    {...register("loanPurpose", {
                      required: {
                        value: true,
                        message: "Loan Purpose is required",
                      },
                    })}
                  >
                    <option value="">Select Loan Purpose</option>
                    <option value="Home Purchase">Home Purchase</option>
                    <option value="Home Refinancing">Home Refinancing</option>
                    <option value="Home Equity">Home Equity</option>
                    <option value="Real Estate Investment">
                      Real Estate Investment
                    </option>
                    <option value="Home Renovation">Home Renovation</option>
                    <option value="Other">Other</option>
                  </select>
                  <p className="text-danger">{errors.loanPurpose?.message}</p>
                </div>

                {/* Approval Status */}
                <div className="col-md-7">
                  <label htmlFor="approvalStatus">
                    <h4>
                      Approval Status <sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className="form-control-lg"
                    type="text"
                    id="approvalStatus"
                    maxLength={50}
                    {...register("approvalStatus", {
                      required: {
                        value: true,
                        message: "Approval Status is required",
                      },
                      maxLength: {
                        value: 50,
                        message:
                          "Approval Status must not exceed 50 characters",
                      },
                      pattern: {
                        value: /^[A-Za-z\s]+$/, // Alphabetic characters and spaces only
                        message: "contain only alphabetic characters",
                      },
                    })}
                  />
                  <p className="text-danger">
                    {errors.approvalStatus?.message}
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

export default LoanDetails;
