import React, { useEffect, useState } from "react";
import "./PreliminaryEligibility.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { FieldErrors, useForm } from "react-hook-form";

type FormValues = {
  loanId: string;
  annualIncome: string;
  employmentStatus: string;
  propertyType: string;
  reportedDate: string;
};

function PreliminaryEligibility() {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    defaultValues: {
      loanId: "",
      annualIncome: "",
      employmentStatus: "",
      propertyType: "",
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
          `http://localhost:8091/api/preEli/put/${editedData.loanId}`,
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
            `http://localhost:8091/api/preEli/put/${existingBorrower.loanId}`,
            data
          );
          const updatedBorrowerList = borrowerList.map((borrower) =>
          borrower.loanId === data.loanId ? data : borrower
        );
        setBorrowerList(updatedBorrowerList);
      } else {
        // Perform a create
        const response = await axios.post(
            "http://localhost:8091/api/preEli/add",
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
      navigate("/loan/GovernmentMonitoring");
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
          "http://localhost:8091/api/preEli/getList"
        );
        setBorrowerList(response.data);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    fetchData();
  }, [form]);

  const fetchBorrowerDataByLoanId = async (loanId: string) => {
    try {
      const response = await axios.get(
        'http://localhost:8091/api/preEli/get/${loanId}'
      );
      const borrowerData=response.data;
      form.reset({
        ...borrowerData,
        loanId:loanId,
      })
    }catch (error){
      console.log("Error fetching data by loan Id:",error)
    }
  }


  return (
    <section className="h-100 h-custom">
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-lg-8 col-xl-6">
            <div className="card-body p-4 p-md-5">
              <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4">
                Preliminary Eligibility Details
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
                  <p className="text-danger">{errors.annualIncome?.message}</p>
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
                  
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PreliminaryEligibility;
