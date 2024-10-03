import React, { useState, useEffect } from "react";
import "./RateLocking.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { FieldErrors, useForm } from "react-hook-form";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

type FormValues = {
  loanId: string;
  rateLockPeriod: String;
  expirationDate: Date | null;
  interestRate: number;
  reportedDate: string;
};

function RateLocking() {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    defaultValues: {
      loanId: "",
      rateLockPeriod: "",
      expirationDate: null,
      interestRate: 0,
      reportedDate: "",
    },
    mode: "all",
  });
  const currentMonth = new Date();
  currentMonth.setDate(1); // Set the day to 1st of the month
  const currentYear = new Date();
  currentYear.setMonth(0); // Set the month to January (0)
  currentYear.setDate(1); // Set the day to 1st of the month
  const currentDate = new Date();

  const { register, handleSubmit, getValues, formState, trigger } = form;
  const { errors } = formState;
  const [formData, setFormData] = useState<FormValues | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<FormValues | null>(null);
  const [borrowerList, setBorrowerList] = useState<FormValues[]>([]);
  const [isLoanIdDisabled, setIsLoanIdDisabled] = useState(false);
  const [value, onChange] = useState<Value>(currentDate);

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoanIdDisabled(true);

      if (isEditing && editedData) {
        data.loanId = editedData.loanId;
        await axios.put(
          "http://localhost:8089/api/rateLocking/put/${editedData.loanId}",
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
            "http://localhost:8089/api/rateLocking/put/${existingBorrower.loanId}",
            data
          );
          const updatedBorrowerList = borrowerList.map((borrower) =>
            borrower.loanId === data.loanId ? data : borrower
          );
          setBorrowerList(updatedBorrowerList);
        } else {
          // Perform a create
          const response = await axios.post(
            "http://localhost:8089/api/rateLocking/add",
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
      navigate("/loan/PropertyInformation");
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
          "http://localhost:8089/api/rateLocking/getList"
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
      await axios.post("http://localhost:8090/api/gmli/saveList", {
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
        navigate("/loan/GovernmentMonitoring");
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
        `http://localhost:8089/api/rateLocking/get/${loanId}`
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
  
  const handleRateLockPeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    const daysToAdd = selectedValue === "1week" ? 7 : selectedValue === "2weeks" ? 14 : selectedValue === "3weeks" ? 21 : 0;
    
    const newDate = daysToAdd > 0 ? new Date(currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000) : null;
    form.setValue("rateLockPeriod", selectedValue);
  
    if (newDate) {
      const formattedDate = `${newDate.getFullYear()}-${(newDate.getMonth() + 1).toString().padStart(2, '0')}-${newDate.getDate().toString().padStart(2, '0')}`;
      
      form.setValue("expirationDate", formattedDate);
    } else {
     
      form.setValue("expirationDate", null);
    }
  
    onChange(newDate);
  };
  
  

  const shouldHighlightDate = (date) => {
    const currentDate = new Date();
    const rateLockPeriod = getValues("rateLockPeriod");
  
    if (rateLockPeriod === "1week") {
      const oneWeekLater = new Date(currentDate);
      oneWeekLater.setDate(oneWeekLater.getDate() + 7);
      return date >= currentDate && date <= oneWeekLater;
    } else if (rateLockPeriod === "2weeks") {
      const twoWeeksLater = new Date(currentDate);
      twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
      return date >= currentDate && date <= twoWeeksLater;
    } else if (rateLockPeriod === "3weeks") {
      const threeWeeksLater = new Date(currentDate);
      threeWeeksLater.setDate(threeWeeksLater.getDate() + 21);
      return date >= currentDate && date <= threeWeeksLater;
    }
    return false;
  };
  

  const tileContent = ({ date }) => {
    if (shouldHighlightDate(date)) {
      return <div className="highlighted-date"></div>;
    } else {
      return null;
    }
  };

  const isFormComplete =
    !errors.loanId &&
    !errors.rateLockPeriod &&
    !errors.interestRate &&
    !errors.reportedDate;
  return (
    <section className="h-100 h-custom">
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-lg-8 col-xl-6">
            <div className="card-body p-4 p-md-5">
              <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4">
                Rate Locking Details
              </p>

              <form
                className="px-md-2"
                onSubmit={handleSubmit(onSubmit, onError)}
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

                {/* Rate Lock Period  */}
                <div className="col-md-7">
                  <label htmlFor="rateLockPeriod">
                    <h4>
                      Rate Lock Period <sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <select
                    className={`form-control-lg ${
                      errors.rateLockPeriod && "invalid"
                    }`}
                    id="rateLockPeriod"
                    {...register("rateLockPeriod", {
                      required: {
                        value: true,
                        message: "Rate Lock Period  is required",
                      },
                    })}
                    onChange={handleRateLockPeriodChange}
                  >
                    <option value="">Select an option</option>
                    <option value="1week">1 Week</option>
                    <option value="2weeks">2 Weeks</option>
                    <option value="3weeks">3 Weeks</option>
                  </select>
                  <p className="text-danger">
                    {errors.rateLockPeriod?.message}
                  </p>
                </div>
                <div className="calender">
                  <Calendar
                    onChange={onChange}
                    value={value}
                    minDate={new Date()}  tileContent={tileContent}
                  />
                </div><br/>

                {/* Expiration Date */}

                <div>
                  <div className="col-md-7">
                    <label htmlFor="expirationDate">
                      <h4>
                        Expiration Date <sup>*</sup>
                      </h4>
                    </label>
                  </div>
                  <div className="mb-4">
                    <input
                      className={`form-control-lg ${
                        errors.expirationDate && "invalid"
                      }`}
                      type="date"
                      id="expirationDate"
                      {...register("expirationDate", {
                        required: {
                          value: true,
                          message: "Expiration Date  is required",
                        },

                        min: {
                          value: new Date().toISOString().split("T")[0],
                          message: "Expiration Date must be in the future",
                        },
                      })}
                    />
                    <p className="text-danger">
                      {errors.expirationDate?.message}
                    </p>
                  </div>
                </div>

                {/* Interest Rate */}
                <div className="col-md-7">
                  <label htmlFor="interestRate">
                    <h4>
                      Interest Rate <sup>*</sup>
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
                    step="any"
                    {...register("interestRate", {
                      required: {
                        value: true,
                        message: "Interest Rate is required",
                      },
                      min: {
                        value: 0,
                        message:
                          "Interest Rate must be greater than or equal to 0",
                      },
                    })}
                  />
                  <p className="text-danger">{errors.interestRate?.message}</p>
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

export default RateLocking;
