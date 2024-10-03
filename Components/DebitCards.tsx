import React, { useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import axios from "axios";

type FormValues = {
  debitCards: {
    cardName: string;
    cardNumber: string;
    expiryDate: string;
  }[];
};

function DebitCards() {
  const [debitCardIndex, setDebitCardIndex] = useState(0);

  const form = useForm<FormValues>({
    defaultValues: {
      debitCards: [
        {
          cardName: "",
          cardNumber: "",
          expiryDate: "",
        },
      ],
    },
    mode: "all",
  });

  const { register, handleSubmit, getValues, formState, trigger } = form;
  const { errors } = formState;

  const addDebitCard = () => {
    setDebitCardIndex(debitCardIndex + 1);
    form.setValue(`debitCards`, [
      ...form.getValues().debitCards,
      {
        cardName: "",
        cardNumber: "",
        expiryDate: "",
      },
    ]);
  };

  const onSubmit = async (data: FormValues) => {
    // Perform API operations here
    try {
      const response = await axios.post(
        "http://localhost:8086/api/loan/add",
        data
      );

      if (response.status === 200) {
        // Successful submission
        toast.success("Form data saved successfully", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const onSave = async () => {
    const isValid = await trigger();
    if (isValid) {
      const formData = form.getValues();

      localStorage.setItem("formData", JSON.stringify(formData));
      console.log("Form data saved:", getValues());
      toast.success("Form data saved successfully", {
        position: toast.POSITION.TOP_RIGHT,
      });
    } else {
      console.log("Form is not complete, cannot save.");
    }
  };

  const onError = (errors: FieldErrors<FormValues>) => {
    console.log("Form errors", errors);
  };

  const isDebitCardValid = (index: number) => {
    const debitCardValues = form.getValues().debitCards[index];
    return (
      debitCardValues.cardName !== "" &&
      debitCardValues.cardNumber !== "" &&
      debitCardValues.expiryDate !== ""
    );
  };

  const handleCardNumberChange = (e, index) => {
    const input = e.target;
    let value = input.value.replace(/\s/g, ""); // Remove existing spaces
    value = value.replace(/\D/g, ""); // Remove non-digit characters
    const formattedValue = value.replace(/(\d{4})/g, "$1 "); // Add space every 4 digits
    input.value = formattedValue.trim(); // Trim to remove any leading/trailing spaces
  };

  return (
    <div className="section_class">
      <section className="h-100 h-custom">
        <div className="container py-5 h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-lg-8 col-xl-6">
              <div className="card-body1 p-4 p-md-4">
                <p className="text-center h2 fw-bold mb-5 mx-1 mx-md-4 mt-4">
                  Debit Card Details
                </p>

                <form
                  className="px-md-2"
                  onSubmit={handleSubmit(onSubmit, onError)}
                  noValidate
                >
                  {form.getValues().debitCards.map((debitCard, index) => (
                    <div key={index}>
                      {/* Card Name */}
                      <div className="col-md-5">
                        <label htmlFor={`debitCards[${index}].cardName`}>
                          <h4>
                            &nbsp;&nbsp; Card Name <sup>*</sup>
                          </h4>
                        </label>
                      </div>
                      <div className="mb-4">
                        <input
                          className={`form-control-lg ${
                            errors.debitCards?.[index]?.cardName && "invalid"
                          }`}
                          type="text"
                          id={`debitCards[${index}].cardName`}
                          {...register(`debitCards[${index}].cardName`, {
                            required: "Card Name is Required",
                            pattern: {
                              value: /^[A-Za-z\s]+$/,
                              message: "Contain only alphabetic characters",
                            },
                          })}
                        />

                        <p className="text-danger">
                          {errors.debitCards?.[index]?.cardName?.message}
                        </p>
                      </div>

                      <div className="col-md-5">
                        <label htmlFor={`debitCards[${index}].cardNumber`}>
                          <h4>
                            &nbsp; Card Number <sup>*</sup>
                          </h4>
                        </label>
                      </div>
                      <div className="mb-4">
                        <input
                          className={`form-control-lg ${
                            errors.debitCards?.[index]?.cardNumber && "invalid"
                          }`}
                          type="text"
                          id={`debitCards[${index}].cardNumber`}
                          maxLength={19} // Allow space characters
                          onInput={(e) => handleCardNumberChange(e, index)}
                          {...register(`debitCards[${index}].cardNumber`, {
                            required: "Card Number is required",
                            pattern: {
                              value: /^\d{4} \d{4} \d{4} \d{4}$/,
                              message:
                                "Must be in the format XXXX XXXX XXXX XXXX",
                            },
                          })}
                        />
                        <p className="text-danger">
                          {errors.debitCards?.[index]?.cardNumber?.message}
                        </p>
                      </div>

                      {/* Expiry Date */}
                      <div className="col-md-5">
                        <label htmlFor={`debitCards[${index}].expiryDate`}>
                          <h4>
                            &nbsp;&nbsp;&nbsp;Expiry Date<sup>*</sup>
                          </h4>
                        </label>
                      </div>
                      <div className="mb-4">
                        <input
                          type="text"
                          id={`debitCards[${index}].expiryDate`}
                          maxLength={7}
                          className={`form-control-lg ${
                            errors.debitCards?.[index]?.expiryDate && "invalid"
                          }`}
                          {...register(`debitCards[${index}].expiryDate`, {
                            required: "Expiry Date is required",
                            pattern: {
                              value: /^(0[1-9]|1[0-2])\/\d{4}$/,
                              message: "Date must be in MM/yyyy format",
                            },
                          })}
                        />

                        <p className="text-danger">
                          {errors.debitCards?.[index]?.expiryDate?.message}
                        </p>
                      </div>
                    </div>
                  ))}

                  <button
                    type="submit"
                    value="Submit"
                    className="btn btn-lg  mb-1"
                    onClick={addDebitCard}
                    disabled={!isDebitCardValid(debitCardIndex)}
                    style={{ color: "black", fontWeight: "bold" }}
                  >
                    Add Debit Card
                  </button>

                  <button
                    type="submit"
                    value="Submit"
                    className="btn btn-lg  mb-1"
                    onClick={onSave}
                  >
                    Save
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DebitCards;
