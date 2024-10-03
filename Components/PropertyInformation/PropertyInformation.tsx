import React, { useEffect, useState } from "react";
import "./PropertyInformation.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { FieldErrors, useForm } from "react-hook-form";

type FormValues = {
  loanId: string;
  propertyAddress: string;
  purchasePrice: string;
  propertyType: string;
  propertyUse: string;
  yearBuilt: string;
  reportedDate: string;
};

function PropertyInformation() {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    defaultValues: {
      loanId: "",
      propertyAddress: "",
      purchasePrice: "",
      propertyType: "",
      propertyUse: "",
      yearBuilt: "",
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
  const { register, handleSubmit, getValues, formState, trigger } = form;
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
          `http://localhost:8088/api/propinfo/put/${editedData.loanId}`,
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
            `http://localhost:8088/api/propinfo/put/${existingBorrower.loanId}`,
            data
          );
          const updatedBorrowerList = borrowerList.map((borrower) =>
            borrower.loanId === data.loanId ? data : borrower
          );
          setBorrowerList(updatedBorrowerList);
        } else {
          // Perform a create
          const response = await axios.post(
            "http://localhost:8088/api/propinfo/add",
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
      navigate("/loan/LoanProgram");
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
          setFormData(parsedData);
        }

        const response = await axios.get(
          "http://localhost:8088/api/propinfo/getList"
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
      await axios.post("http://localhost:8088/api/propinfo/saveList", {
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
        if (formData.loanId !== editedData?.loanId) {
          setIsLoanIdDisabled(true);
        }
        if (borrowerList.length > 0) {
          saveBorrowerList();
        }
        navigate("/loan/RateLocking");
      } else {
        console.log("User chose not to proceed.");
      }
    } else {
      console.log("Form is not complete, cannot proceed to next.");
      window.alert("Form is not complete. Please fill in all required fields.");
    }
  };

  const isFormComplete =
    !errors.loanId &&
    !errors.propertyAddress &&
    !errors.purchasePrice &&
    !errors.propertyType &&
    !errors.propertyUse &&
    !errors.yearBuilt &&
    !errors.reportedDate;

    const fetchBorrowerDataByLoanId = async (loanId: string) => {
      try {
        const response = await axios.get(
          `http://localhost:8088/api/propinfo/get/${loanId}`
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
                Property Information Details
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

                {/* Property Address */}
                <div className="col-md-7">
                  <label htmlFor="propertyAddress">
                    <h4>
                      Property Address <sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.propertyAddress && "invalid"
                    }`}
                    type="text"
                    id="propertyAddress"
                    maxLength={200}
                    {...register("propertyAddress", {
                      required: {
                        value: true,
                        message: " MaxLength 200 is required",
                      },
                      pattern: {
                        value: /^[A-Za-z0-9\s]+$/,
                        message: "Should contain only alphabetic characters",
                      },
                      maxLength: {
                        value: 200,
                        message: "Exceeds maximum length of 200 characters",
                      },
                    })}
                  />
                  <p className="text-danger">
                    {errors.propertyAddress && errors.propertyAddress.message}
                  </p>
                </div>

                {/* Purchase Price */}
                <div className="col-md-7">
                  <label htmlFor="purchasePrice">
                    <h4>
                      Purchase Price <sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.purchasePrice && "invalid"
                    }`}
                    type="number"
                    id="purchasePrice"
                    {...register("purchasePrice", {
                      valueAsNumber: true,
                      required: {
                        value: true,
                        message: "Purchase Price is required",
                      },
                      validate: {
                        nonNegativeValidation: validateNonNegative,
                      },
                    })}
                    onKeyUp={() => {
                      trigger("purchasePrice");
                    }}
                  />
                  <p className="text-danger">{errors.purchasePrice?.message}</p>
                </div>

                {/* Property Type */}
                <div className="col-md-7">
                  <label htmlFor="propertyType">
                    <h4>
                      Property Type <sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <select
                    id="propertyType"
                    className={`select form-control-lg ${
                      errors.propertyType && "invalid"
                    }`}
                    {...register("propertyType", {
                      required: {
                        value: true,
                        message: "Property Type is required",
                      },
                    })}
                  >
                    <option value="">Select a Property Type</option>
                    <option value="residentialProperty">
                      Residential Property
                    </option>
                    <option value="commercialProperty">
                      Commercial Property
                    </option>
                    <option value="industrialProperty">
                      Industrial Property
                    </option>
                    <option value="agriculturalProperty">
                      Agricultural Property{" "}
                    </option>
                    <option value="vacantLand">Vacant Land</option>
                    <option value="specializedProperty">
                      Specialized Property
                    </option>
                    <option value="mixed-useProperty">
                      Mixed-use Property
                    </option>
                    <option value="otherPropertyTypes">
                      Other Property Types
                    </option>
                  </select>
                  <p className="text-danger">{errors.propertyType?.message}</p>
                </div>

                {/* Property Use */}
                <div className="col-md-7">
                  <label htmlFor="propertyUse">
                    <h4>
                      Property Use <sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <select
                    id="propertyUse"
                    className={`select form-control-lg ${
                      errors.propertyUse && "invalid"
                    }`}
                    {...register("propertyUse", {
                      required: {
                        value: true,
                        message: "Property Use is required",
                      },
                    })}
                  >
                    <option value="">Select Property Use</option>
                    <option value="Home Equity Loans and Lines of Credit">
                      Home Equity Loans and Lines of Credit
                    </option>
                    <option value="Commercial Real Estate Loans">
                      Commercial Real Estate Loans
                    </option>
                    <option value="Auto Loans">Auto Loans</option>
                    <option value="Secured Personal Loans">
                      Secured Personal Loans
                    </option>
                    <option value="Construction Loans">
                      Construction Loans
                    </option>
                    <option value="Business Loans">Business Loans</option>
                    <option value="Asset-Backed Securities">
                      Asset-Backed Securities
                    </option>
                    <option value="Real Estate Investment">
                      Real Estate Investment
                    </option>
                    <option value="Investment Property Loans">
                      Investment Property Loans
                    </option>
                  </select>
                  <p className="text-danger">{errors.propertyUse?.message}</p>
                </div>

                {/* Year Built */}
                <div className="col-md-7">
                  <label htmlFor="yearBuilt">
                    <h4>Year Built</h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${
                      errors.yearBuilt && "invalid"
                    }`}
                    type="number"
                    id="yearBuilt"
                    {...register("yearBuilt", {
                      valueAsNumber: true,
                      min: {
                        value: 0,
                        message:
                          "Year Built must be greater than or equal to 0",
                      },

                      max: {
                        value: new Date().getFullYear(),
                        message: `Year Built must be less than or equal to ${new Date().getFullYear()}`,
                      },
                    })}
                  />
                  <p className="text-danger">{errors.yearBuilt?.message}</p>
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

export default PropertyInformation;
