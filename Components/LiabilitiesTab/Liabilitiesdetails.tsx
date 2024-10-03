import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Liabilities.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FieldErrors, useForm } from "react-hook-form";

type FormValues = {
  loanId: string;
  liabilityType: string;
  liabilityAmount: string;
  creditCardDebt: string;
  studentLoanDebt: string;
  carLoanDebt: string;
  otherLoans: string;
  mortgageDebt: string;
  otherLiabilities: string;
  reportedDate: string;
};

function Liabilitiesdetails() {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    defaultValues: {
      loanId: "",
      liabilityType: "",
      liabilityAmount: "",
      creditCardDebt: "",
      studentLoanDebt: "",
      carLoanDebt: "",
      otherLoans: "",
      mortgageDebt: "",
      otherLiabilities: "",
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<FormValues | null>(null);
  const [borrowerList, setBorrowerList] = useState<FormValues[]>([]);
  const { errors } = formState;
  const [formData, setFormData] = useState<FormValues | null>(null);
  const [isLoanIdDisabled, setIsLoanIdDisabled] = useState(false);

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoanIdDisabled(true);
      if (isEditing && editedData) {
        data.loanId = editedData.loanId;
        await axios.put(
          `http://localhost:8085/api/liabilities/put/${editedData.loanId}`,
          data
        );
        // Update the liabilitiesList state
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
            `http://localhost:8085/api/liabilities/put/${existingBorrower.loanId}`,
            data
          );
          const updatedBorrowerList = borrowerList.map((borrower) =>
            borrower.loanId === data.loanId ? data : borrower
          );
          setBorrowerList(updatedBorrowerList);
        } else {
          // Perform a create
          const response = await axios.post(
            "http://localhost:8085/api/liabilities/add",
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
  const onEdit = (borrower: FormValues) => {
    setIsEditing(true);
    setEditedData(borrower);
    setIsLoanIdDisabled(true);
  };

  const goToPreviousStep = () => {
    const shouldNavigate = window.confirm(
      "Do you want to go back to the previous step?"
    );
    if (shouldNavigate) {
      navigate("/loan/Assetsdetails");
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
          setFormData(parsedData);
        }
        const response = await axios.get(
          "http://localhost:8085/api/liabilities/getList"
        );
        setBorrowerList(response.data);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    fetchData();
  }, [form]);

  const saveBorrowerList = async () => {
    try {
      await axios.post("http://localhost:8085/api/liabilities/saveList", {
        borrowers: borrowerList,
      });

      setBorrowerList([]);
    } catch (error) {
      console.error("Error saving liabilities list:", error);
    }
  };

  const onNext = async () => {
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
        navigate("/loan/LoanDetails");
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
        `http://localhost:8085/api/liabilities/get/${loanId}`
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
    !errors.liabilityType &&
    !errors.liabilityAmount &&
    !errors.creditCardDebt &&
    !errors.studentLoanDebt &&
    !errors.carLoanDebt &&
    !errors.otherLoans &&
    !errors.mortgageDebt &&
    !errors.otherLiabilities &&
    !errors.reportedDate;

  return (
    <section className="h-100 h-custom">
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-lg-8 col-xl-6">
            <div className="card-body p-4 p-md-5">
              <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">
                Liabilities Details
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
                {/*  Liability Amount  */}
                <div className="col-md-7">
                  <label htmlFor=" liabilityAmount">
                    <h4>
                      Liability Amount <sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.liabilityAmount && "invalid"
                    }`}
                    type="number"
                    id=" liabilityAmount"
                    {...register("liabilityAmount", {
                      valueAsNumber: true,
                      required: {
                        value: true,
                        message: " Liability Amount is required",
                      },
                    })}
                  />
                  <p className="text-danger">
                    {errors.liabilityAmount?.message}
                  </p>
                </div>

                {/* Liability Type */}
                <div className="col-md-7">
                  <label htmlFor="liabilityType">
                    <h4>Liability Type</h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className="form-control-lg"
                    type="text"
                    id="liabilityType"
                    {...register("liabilityType", {
                      pattern: {
                        value: /^[A-Za-z\s]*$/,
                        message: " contain only alphabetic characters",
                      },
                      maxLength: {
                        value: 100,
                        message: "Maximum allowed length is 100",
                      },
                    })}
                  />
                  <p className="text-danger">{errors.liabilityType?.message}</p>
                </div>

                {/*  Credit Card Debt */}

                <div className="col-md-7">
                  <label htmlFor=" creditCardDebt">
                    <h4>Credit Card Debt</h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.creditCardDebt && "invalid"
                    }`}
                    type="number"
                    id=" creditCardDebt"
                    {...register("creditCardDebt", {
                      valueAsNumber: true,
                    })}
                  />
                  <p className="text-danger">
                    {errors.creditCardDebt?.message}
                  </p>
                </div>

                {/* Student Loan Debt  */}
                <div className="col-md-7">
                  <label htmlFor="studentLoanDebt">
                    <h4>Student Loan Debt</h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.studentLoanDebt && "invalid"
                    }`}
                    type="number"
                    id="studentLoanDebt"
                    {...register("studentLoanDebt", {
                      valueAsNumber: true,
                    })}
                  />
                  <p className="text-danger">
                    {errors.studentLoanDebt?.message}
                  </p>
                </div>

                {/* Car Loan Debt*/}
                <div className="col-md-7">
                  <label htmlFor="carLoanDebt">
                    <h4>Car Loan Debt</h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className="form-control-lg"
                    type="number"
                    id="carLoanDebt"
                    {...register("carLoanDebt", {
                      valueAsNumber: true,
                      validate: {
                        nonNegativeValidation: validateNonNegative,
                      },
                    })}
                  />
                  <p className="text-danger">{errors.carLoanDebt?.message}</p>
                </div>

                {/* Other Loans */}
                <div className="col-md-7">
                  <label htmlFor="otherLoans">
                    <h4>Other Loans</h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className="form-control-lg"
                    type="number"
                    id="otherLoans"
                    {...register("otherLoans", {
                      valueAsNumber: true,
                      validate: {
                        nonNegativeValidation: validateNonNegative,
                      },
                    })}
                  />
                  <p className="text-danger">{errors.otherLoans?.message}</p>
                </div>

                {/* Mortgage Debt */}
                <div className="col-md-7">
                  <label htmlFor="mortgageDebt">
                    <h4>Mortgage Debt</h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className="form-control-lg"
                    type="number"
                    id="mortgageDebt"
                    {...register("mortgageDebt", {
                      validate: {
                        nonNegativeValidation: validateNonNegative,
                      },
                    })}
                  />
                  <p className="text-danger">{errors.mortgageDebt?.message}</p>
                </div>

                {/* Other Liabilities */}
                <div className="col-md-7">
                  <label htmlFor="otherLiabilities">
                    <h4>Other Liabilities</h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className="form-control-lg"
                    type="text"
                    id="otherLiabilities"
                    {...register("otherLiabilities", {
                      pattern: {
                        value: /^[A-Za-z\s]*$/,
                        message:
                          "Other Liabilities should contain only alphabetic characters",
                      },
                      maxLength: {
                        value: 200,
                        message: "Maximum allowed length is 200",
                      },
                    })}
                  />
                  <p className="text-danger">
                    {errors.otherLiabilities?.message}
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
export default Liabilitiesdetails;
