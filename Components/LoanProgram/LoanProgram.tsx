import React, { useEffect, useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import "./LoanProgram.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

type FormValues = {
  loanId: string;
  loanProgram: string;
  interestRate: number;
  loanTenure: number;
  downPayment: number;
  processingFee: number;
  reportedDate: string;
};

function LoanProgram() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,getValues,
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      loanId: "",
      loanProgram: "select",
      interestRate: 0,
      loanTenure: 0,
      downPayment: 0,
      processingFee: 0,
      reportedDate: "",
    },
    mode: "all",
  });


  const [formData, setFormData] = useState<FormValues | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<FormValues | null>(null);
  const [borrowerList, setBorrowerList] = useState<FormValues[]>([]);
  const [isLoanIdDisabled, setIsLoanIdDisabled] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState("select");

  const loanProgramData = {
    select: {
      interestRate: 0,
      loanAmount: 0,
      loanTenure: 0,
      downPayment: 0,
      processingFee: 0,
    },
    VA: {
      interestRate: 3.5,
      loanAmount: 250000,
      loanTenure: 30,
      downPayment: 50000,
      processingFee: 1000,
    },
    FHA: {
      interestRate: 4.0,
      loanAmount: 200000,
      loanTenure: 25,
      downPayment: 40000,
      processingFee: 1200,
    },
    Conventional: {
      interestRate: 3.75,
      loanAmount: 280000,
      loanTenure: 30,
      downPayment: 60000,
      processingFee: 1500,
    },
    USDA: {
      interestRate: 3.25,
      loanAmount: 220000,
      loanTenure: 20,
      downPayment: 45000,
      processingFee: 800,
    },
  };

  const fetchLoanProgramDetails = (selectedProgram: string) => {
    const details = loanProgramData[selectedProgram];
    if (details) {
      setValue("interestRate", details.interestRate);
      setValue("loanTenure", details.loanTenure);
      setValue("downPayment", details.downPayment);
      setValue("processingFee", details.processingFee);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProgram = e.target.value;
    setSelectedProgram(selectedProgram);
    fetchLoanProgramDetails(selectedProgram);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoanIdDisabled(true);
  
      if (isEditing && editedData) {
        data.loanId = editedData.loanId;
        await axios.put(
          `http://localhost:8087/api/loanprogram/put/${editedData.loanId}`,
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
            `http://localhost:8087/api/loanprogram/put/${existingBorrower.loanId}`,
            data
          );
  
          const updatedBorrowerList = borrowerList.map((borrower) =>
            borrower.loanId === data.loanId ? data : borrower
          );
          setBorrowerList(updatedBorrowerList);
        } else {
          // Perform a create
          const response = await axios.post(
            "http://localhost:8087/api/loanprogram/add",
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
        console.error("Status Code:", error.response.status);
        console.error("Response Data:", error.response.data);
      } else if (error.request) {
        
      } else {
        console.error("Error:", error.message);
      }
    }
  };
  
  const goToPreviousStep = () => {
    const shouldNavigate = window.confirm(
      "Do you want to go back to the previous step?"
    );
    if (shouldNavigate) {
      navigate("/loan/LoanDetails");
    } else {
      console.log("User chose not to go back.");
    }
  };

  const onSave = async () => {
    const isValid = await trigger();
    if (isValid) {
      const formData = getValues();
      setEditedData(formData);
      const loanProgramDetails = loanProgramData[selectedProgram];
      if (loanProgramDetails) {
        formData.interestRate = loanProgramDetails.interestRate;
        formData.loanTenure = loanProgramDetails.loanTenure;
        formData.downPayment = loanProgramDetails.downPayment;
        formData.processingFee = loanProgramDetails.processingFee;
      }
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
          reset(parsedData);
          setFormData(parsedData);
          fetchLoanProgramDetails(selectedProgram);
        }
        const response = await axios.get(
          "http://localhost:8087/api/loanprogram/getList"
        );
        setBorrowerList(response.data);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    fetchData();
  }, [reset, selectedProgram]);

  const onEdit = (borrower: FormValues) => {
    setIsEditing(true);
    setEditedData(borrower);
    setIsLoanIdDisabled(true);
  };

  const saveBorrowerList = async () => {
    try {
      await axios.post("http://localhost:8087/api/loanprogram/saveList", {
        borrowers: borrowerList,
      });

      setBorrowerList([]);
    } catch (error) {
      console.error("Error saving borrower list:", error);
    }
  };

  const fetchBorrowerDataByLoanId = async (loanId: string) => {
    try {
      const response = await axios.get(`http://localhost:8087/api/loanprogram/get/${loanId}`);
      const borrowerData = response.data;
      reset({
        ...borrowerData,
        loanId: loanId,
      });
    } catch (error) {
      console.log("Error fetching data by loan Id:", error);
    }
  };

  const onNext = async () => {
    console.log("Next button clicked");
    const isValid = await trigger();
    if (isValid && isFormComplete) {
      const formData = getValues();
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
        navigate("/loan/PropertyInformation");
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
    !errors.loanProgram &&
    !errors.interestRate &&
    !errors.loanTenure &&
    !errors.downPayment &&
    !errors.processingFee &&
    !errors.reportedDate;


  return (
    <section className="h-100 h-custom">
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-lg-8 col-xl-6">
            <div className="card-body p-4 p-md-5">
              <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 ">
                Loan Program Options  Details
              </p>

              <form
                className="px-md-2"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                <div className="col-md-7">
                  <label htmlFor="loanId">
                    <h4>
                      Loan Id <sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${errors.loanId || isLoanIdDisabled ? "invalid" : ""}`}
                    type="text"
                    id="loanId"
                    {...register("loanId", {
                      required: {
                        value: true,
                        message: "Loan Id is required",
                      },
                      pattern: {
                        value: /^[A-Za-z0-9\s]+$/,
                        message: "Contain only alphabetic characters",
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

                <div className="col-md-7">
                  <label htmlFor="loanProgram">
                    <h4>
                      Loan Program <sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <select
                    id="loanProgram"
                    className={`form-control-lg ${errors.loanProgram ? "invalid" : ""}`}
                    {...register("loanProgram", {
                      required: {
                        value: true,
                        message: "Loan Program Name is required",
                      },
                    })}
                    onChange={handleSelectChange}
                    value={selectedProgram}
                  >
                    <option value="select">Select Loan Program</option>
                    <option value="VA">VA Loan</option>
                    <option value="FHA">FHA Loan</option>
                    <option value="Conventional">Conventional Loan</option>
                    <option value="USDA">USDA Loan</option>
                  </select>
                  <p className="text-danger">{errors.loanProgram?.message}</p>
                </div>

                <div className="col-md-7">
                  <label htmlFor="interestRate">
                    <h4>
                      Interest Rate <sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${errors.interestRate ? "invalid" : ""}`}
                    type="number"
                    id="interestRate"
                    {...register("interestRate", {
                      valueAsNumber: true,
                      required: {
                        value: true,
                        message: "Interest Rate is required",
                      },
                    })}
                    onKeyUp={() => {
                      trigger("interestRate");
                    }}
                    disabled={selectedProgram === "select"}
                  />
                  <p className="text-danger">{errors.interestRate?.message}</p>
                </div>

                <div className="col-md-7">
                  <label htmlFor="loanTenure">
                    <h4>
                      Loan Tenure <sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${errors.loanTenure ? "invalid" : ""}`}
                    type="number"
                    id="loanTenure"
                    {...register("loanTenure", {
                      required: {
                        value: true,
                        message: "Loan Tenure is required",
                      },
                    })}
                    disabled={selectedProgram === "select"}
                  />
                  <p className="text-danger">{errors.loanTenure?.message}</p>
                </div>

                {/* Down Payment */}
                <div className="col-md-7">
                  <label htmlFor="downPayment">
                    <h4>
                      Down Payment <sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${errors.downPayment && "invalid"}`}
                    type="number"
                    id="downPayment"
                    {...register("downPayment", {
                      required: "Down Payment is required",
                    })}
                    disabled={selectedProgram === "select"}
                  />
                  {errors.downPayment && (
                    <p className="text-danger">{errors.downPayment.message}</p>
                  )}
                </div>

                {/* Processing Fee */}
                <div className="col-md-7">
                  <label htmlFor="processingFee">
                    <h4>
                    Processing Fee<sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <input
                    className={`form-control-lg ${errors.processingFee && "invalid"}`}
                    type="number"
                    id="processingFee"
                    {...register("processingFee", {
                      required: "Processing Fee is required",
                    })}
                    disabled={selectedProgram === "select"}
                  />
                  {errors.processingFee && (
                    <p className="text-danger">{errors.processingFee.message}</p>
                  )}
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

export default LoanProgram;
