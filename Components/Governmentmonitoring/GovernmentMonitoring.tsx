import React, { useEffect, useState } from "react";
import "./GovernmentMonitoring.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FieldErrors, useForm } from "react-hook-form";

type FormValues = {
  loanId: string;
  socialSecurityNumber: string;
  dateOfBirth: string;
  ethnicity: string;
  race: string;
  reportedDate: string;
};

function GovernmentMonitoring() {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    defaultValues: {
      loanId: "",
      socialSecurityNumber: "",
      dateOfBirth: "",
      ethnicity: "",
      race: "",
      reportedDate: "",
    },
    mode: "all",
  });

  const { register, handleSubmit, getValues, formState, trigger, setValue } =
    form;
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
          `http://localhost:8090/api/gmli/put/${editedData.loanId}`,
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
            `http://localhost:8090/api/gmli/put/${existingBorrower.loanId}`,
            data
          );
          const updatedBorrowerList = borrowerList.map((borrower) =>
            borrower.loanId === data.loanId ? data : borrower
          );
          setBorrowerList(updatedBorrowerList);
        } else {
          // Perform a create
          const response = await axios.post(
            "http://localhost:8090/api/gmli/add",
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
      navigate("/loan/RateLocking");
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
          "http://localhost:8090/api/gmli/getList"
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
        navigate("/loan/PreliminaryEligibility");
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
        `http://localhost:8090/api/gmli/get/${loanId}`
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
    !errors.socialSecurityNumber &&
    !errors.dateOfBirth &&
    !errors.ethnicity &&
    !errors.race &&
    !errors.reportedDate;

  return (
    <section className="h-100 h-custom">
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-lg-8 col-xl-6">
            <div className="card-body p-4 p-md-5">
              <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4">
                Government Monitoring on Legal Details
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

                {/*  Social Security Number */}

                {/* Social Security Number */}
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
                    maxLength={11} // 9 digits + 2 dashes
                    {...register("socialSecurityNumber", {
                      required: "Social Security Number (SSN) is required",
                      pattern: {
                        value: /^\d{3}-\d{2}-\d{4}$/, // Valid format: xxx-xx-xxxx
                        message: "SSN must be in xxx-xx-xxxx format",
                      },
                    })}
                    onChange={(e) => {
                      const input = e.target;
                      const value = input.value.replace(/\D/g, ""); // Remove non-digit characters
                      if (value.length >= 3) {
                        input.value = `${value.slice(0, 3)}-${value.slice(
                          3,
                          5
                        )}-${value.slice(5, 9)}`;
                      } else {
                        input.value = value;
                      }
                    }}
                  />
                  <p className="text-danger">
                    {errors.socialSecurityNumber?.message}
                  </p>
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

                {/* Ethnicity */}
                <div className="col-md-7">
                  <label htmlFor="ethnicity">
                    <h4>
                      Ethnicity <sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <select
                    className={`form-control-lg ${
                      errors.ethnicity && "invalid"
                    }`}
                    id="ethnicity"
                    {...register("ethnicity", {
                      required: "Ethnicity is required",
                    })}
                  >
                    <option value="">Select an option</option>
                    <option value="White">White</option>
                    <option value="African American/Black">
                      African American/Black
                    </option>
                    <option value="Hispanic/Latino">Hispanic/Latino</option>
                    <option value="Asian American">Asian American</option>
                    <option value="Native American/American Indian">
                      Native American/American Indian
                    </option>
                    <option value="Pacific Islander">Pacific Islander</option>
                    <option value="Middle Eastern/North African">
                      Middle Eastern/North African z
                    </option>
                    <option value="Two or More Races">Two or More Races</option>
                    <option value="Other">Other</option>
                  </select>
                  <p className="text-danger">{errors.ethnicity?.message}</p>
                </div>

                {/* Race */}
                <div className="col-md-7">
                  <label htmlFor="race">
                    <h4>
                      Race <sup>*</sup>
                    </h4>
                  </label>
                </div>
                <div className="mb-4">
                  <select
                    className={`form-control-lg ${errors.race && "invalid"}`}
                    id="race"
                    {...register("race", {
                      required: "Race is required",
                    })}
                  >
                    <option value="">Select an option</option>

                    <option value="White">White</option>
                    <option value="Black or African American">
                      Black or African American
                    </option>
                    <option value="Hispanic or Latino">
                      Hispanic or Latino
                    </option>
                    <option value="Asian">Asian</option>
                    <option value="Native American or American Indian">
                      Native American or American Indian
                    </option>
                    <option value="Native Hawaiian or Pacific Islander">
                      Native Hawaiian or Pacific Islander
                    </option>
                    <option value="Two or more races">Two or more races</option>
                    <option value="Other or Prefer not to say">
                      Other or Prefer not to say
                    </option>
                  </select>
                  <p className="text-danger">{errors.race?.message}</p>
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

export default GovernmentMonitoring;
