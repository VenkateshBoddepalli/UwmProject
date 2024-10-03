import React, { useEffect, useState } from "react";
import "./AssetsTab.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { FieldErrors, useForm } from "react-hook-form";

type FormValues = {
  loanId: string;
  assetType: string;
  assetValue: string;
  checkingAccountBalance: string;
  savingsAccountBalance: string;
  investmentAccountBalance: string;
  retirementAccountBalance: string;
  otherAssets: string;
  reportedDate: string;
};

function Assetsdetails() {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    defaultValues: {
      loanId: "",
      assetType: "",
      assetValue: "",
      checkingAccountBalance: "",
      savingsAccountBalance: "",
      investmentAccountBalance: "",
      retirementAccountBalance: "",
      otherAssets: "",
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
          `http://localhost:8084/api/assets/put/${editedData.loanId}`,
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
            `http://localhost:8084/api/assets/put/${existingBorrower.loanId}`,
            data
          );
          const updatedBorrowerList = borrowerList.map((borrower) =>
            borrower.loanId === data.loanId ? data : borrower
          );
          setBorrowerList(updatedBorrowerList);
        } else {
          // Perform a create
          const response = await axios.post(
            "http://localhost:8084/api/assets/add",
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
      navigate("/loan/Employmentdetails");
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
          //setFormData(parsedData);
        }

        const response = await axios.get(
          "http://localhost:8084/api/assets/getList"
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
      await axios.post("http://localhost:8084/api/assets/saveList", {
        borrowers: borrowerList,
      });
      setBorrowerList([]);
    } catch (error) {
      console.error("Error saving borrower list:", error);
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
        navigate("/loan/Liabilitiesdetails");
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
        `http://localhost:8084/api/assets/get/${loanId}`
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
    !errors.assetType &&
    !errors.assetValue &&
    !errors.checkingAccountBalance &&
    !errors.savingsAccountBalance &&
    !errors.investmentAccountBalance &&
    !errors.retirementAccountBalance &&
    !errors.otherAssets &&
    !errors.reportedDate;
  return (
    <section className="h-100 h-custom">
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-lg-8 col-xl-6">
            <div className="card-body p-4 p-md-5">
              <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4">
                Asset Details
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
                {/* Asset Type */}

                <div className="col-md-7">
                  <label htmlFor="assetType">
                    <h4>Asset Type</h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.assetType && "invalid"
                    }`}
                    type="text"
                    id="assetType"
                    {...register("assetType", {
                      pattern: {
                        value: /^[A-Za-z]+$/,
                        message: "contain only alphabetic characters",
                      },
                      maxLength: {
                        value: 100,
                        message: "Maximum allowed length is 100",
                      },
                    })}
                  />
                  <p className="text-danger">{errors.assetType?.message}</p>
                </div>

                {/*  Asset Value */}

                <div className="col-md-7">
                  <label htmlFor="assetValue">
                    <h4>
                      Asset Value<sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.assetValue && "invalid"
                    }`}
                    type="number"
                    id="assetValue"
                    {...register("assetValue", {
                      valueAsNumber: true,
                      required: {
                        value: true,
                        message: "Asset Value is Required",
                      },
                      validate: {
                        nonNegativeValidation: validateNonNegative,
                      },
                    })}
                    onKeyUp={() => {
                      trigger("assetValue");
                    }}
                  />
                  <p className="text-danger">{errors.assetValue?.message}</p>
                </div>

                
                {/* checkingAccountBalance */}
                <div className="col-md-7">
                  <label htmlFor="checkingAccountBalance">
                    <h4>
                      Checking Account Balance<sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.checkingAccountBalance && "invalid"
                    }`}
                    type="number"
                    id="checkingAccountBalance"
                    {...register("checkingAccountBalance", {
                      valueAsNumber: true,
                      required: {
                        value:
                          !getValues("savingsAccountBalance") &&
                          !getValues("investmentAccountBalance"),
                        message: "At least any one of the field (checkingAccountBalance, savingsAccountBalance, investmentAccountBalance) should be entered",
                      },
                      validate: {
                        nonNegativeValidation: validateNonNegative,
                      },
                    })}
                    onKeyUp={() => {
                      trigger("checkingAccountBalance");
                    }}
                  />
                  <p className="text-danger">
                    {errors.checkingAccountBalance?.message}
                  </p>
                </div>

                {/* savingsAccountBalance */}
                <div className="col-md-7">
                  <label htmlFor="savingsAccountBalance">
                    <h4>
                      Savings Account Balance<sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.savingsAccountBalance && "invalid"
                    }`}
                    type="number"
                    id="savingsAccountBalance"
                    {...register("savingsAccountBalance", {
                      valueAsNumber: true,

                      validate: {
                        nonNegativeValidation: validateNonNegative,
                      },
                    })}
                    onKeyUp={() => {
                      trigger("savingsAccountBalance");
                    }}
                  />
                  <p className="text-danger">
                    {errors.savingsAccountBalance?.message}
                  </p>
                </div>
                {/* investmentAccountBalance */}
                <div className="col-md-7">
                  <label htmlFor="investmentAccountBalance">
                    <h4>
                      Investment Account Balance<sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.investmentAccountBalance && "invalid"
                    }`}
                    type="number"
                    id="investmentAccountBalance"
                    {...register("investmentAccountBalance", {
                      valueAsNumber: true,

                      validate: {
                        nonNegativeValidation: validateNonNegative,
                      },
                    })}
                    onKeyUp={() => {
                      trigger("investmentAccountBalance");
                    }}
                  />
                  <p className="text-danger">
                    {errors.investmentAccountBalance?.message}
                  </p>
                </div>

                {/* retirementAccountBalance */}
                <div className="col-md-7">
                  <label htmlFor="retirementAccountBalance">
                    <h4>Retirement Account Balance</h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.retirementAccountBalance && "invalid"
                    }`}
                    type="number"
                    id="retirementAccountBalance"
                    {...register("retirementAccountBalance", {
                      validate: {
                        nonNegativeValidation: validateNonNegative,
                      },
                    })}
                  />
                  <p className="text-danger">
                    {errors.retirementAccountBalance?.message}
                  </p>
                </div>

                {/* other Assets */}

                <div className="col-md-7">
                  <label htmlFor="otherAssets">
                    <h4>Other Assets</h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.otherAssets && "invalid"
                    }`}
                    type="text"
                    id="otherAssets"
                    {...register("otherAssets", {
                      pattern: {
                        value: /^[A-Za-z]+$/,
                        message: "contain only alphabetic characters",
                      },
                      maxLength: {
                        value: 200,
                        message: "Maximum allowed length is 200",
                      },
                    })}
                  />
                  <p className="text-danger">{errors.otherAssets?.message}</p>
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
export default Assetsdetails;
