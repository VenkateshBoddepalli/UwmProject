import React, { useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import {  useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "./auth";
import axios from 'axios';

type FormValues = {
  agent_name: string;
  agent_id:string;
  agent_email: string;
  agent_password: String;
};
function Login() {
  const form = useForm<FormValues>({
    defaultValues: {
      agent_name: "",
      agent_id: "",
      agent_email: "",
      agent_password: "",
    },
    mode: "all",
  });
  const navigate = useNavigate();
  const { register, handleSubmit, formState, trigger, watch, setValue } = form;
  const { errors } = formState;
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);

  const fetchAgentData = async (agentId: number) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/uwm/agent/get/${agentId}`
      );

      console.log("Fetched Agent Data:", response.data);
      setValue("agent_name", response.data.agent_name);
      setValue("agent_email", response.data.agent_email);
      // setValue("agent_password", response.data.agent_password);
    } catch (error) {
      console.error("Error fetching agent data:", error);
    }
  };

  const onAgentIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const agentId = parseInt(event.target.value, 10);
    if (!isNaN(agentId)) {
      fetchAgentData(agentId);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      console.log("Login Data:", data);
      const response = await axios.get(
        `http://localhost:8080/api/uwm/agent/get/${data.agent_id}`
      );
      const databaseAgentPassword = response.data.agent_password;
      if (data.agent_password === databaseAgentPassword) {

        toast.success("Login Success");
        login(data);
        navigate("/loan");
      } else {

        toast.error("Invalid Password");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Login Failed");
    } finally {
      setLoading(false);
    }
  };

  const onError = (errors: FieldErrors<FormValues>) => {
    console.log("Form errors", errors);
  };


  return (
    <div className="section_class">
      <section className="h-100 h-custom">
        <div className="container py-5 h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-lg-8 col-xl-6">
              <div className="card-body1 p-4 p-md-4">
                <p className="text-center h2 fw-bold mb-5 mx-1 mx-md-4 mt-4">
                  Agent Login
                </p>

                <form
                  className="px-md-2"
                  onSubmit={handleSubmit(onSubmit, onError)}
                  noValidate
                >
                  {/* Employ Id    */}

                  <div className="col-md-5">
                    <label htmlFor="id">
                      <h4>
                        <span>
                          <i className="fa-solid fa-id-card fa-flip"></i>
                        </span>
                        &nbsp; Agent Id <sup>*</sup>
                      </h4>
                    </label>
                  </div>
                  <div className="mb-4">
                    <input
                      className={`form-control-lg ${errors.agent_id && "invalid"}`}
                      type="text"
                      id="agent_id"
                      {...register("agent_id", {
                        required: "Id Is Required",
                        
                      })}
                      onChange={onAgentIdChange}
                    />
                    <p className="text-danger">{errors.agent_id?.message}</p>
                  </div>

                  {/* Employer Name */}
                  <div className="col-md-5">
                    <label htmlFor="name">
                      <h4>
                        <span>
                          <i className="fa-solid fa-user fa-flip"></i>
                        </span>
                        &nbsp;&nbsp; Name <sup>*</sup>
                      </h4>
                    </label>
                  </div>
                  <div className="mb-4">
                    <input
                      className={`form-control-lg ${errors.agent_name && "invalid"}`}
                      type="text"
                      id="agent_name"
                      {...register("agent_name", {
                        required: "Agent Name is Required",
                        pattern: {
                          value: /^[A-Za-z\s]+$/,
                          message: "Contain only alphabetic characters",
                        },
                      })}
                    />
                    <p className="text-danger">{errors.agent_name?.message}</p>
                  </div>
                  {/* Employ Email */}
                  <div className="col-md-5">
                    <label htmlFor="email">
                      <h4>
                        <span>
                          <i className="fa-solid fa-envelope fa-flip"></i>
                        </span>
                        &nbsp;&nbsp;&nbsp;Email<sup>*</sup>
                      </h4>
                    </label>
                  </div>
                  <div className="mb-4">
                    <input
                      className={`form-control-lg ${errors.agent_email && "invalid"}`}
                      type="text"
                      id="agent_email"
                      {...register("agent_email", {
                        required: "Agent Email is Required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      onKeyUp={() => {
                        trigger("agent_email");
                      }}
                    />
                    <p className="text-danger">{errors.agent_email?.message}</p>
                  </div>
                  {/* Employ Password */}
                  <div className="col-md-5">
                    <label htmlFor="password">
                      <h4>
                        <span>
                          <i className="fa-solid fa-lock fa-flip"></i>
                        </span>
                        &nbsp;&nbsp;&nbsp;Password<sup>*</sup>
                      </h4>
                    </label>
                  </div>
                  <div className="mb-4">
                    <input
                      className={`form-control-lg ${errors.agent_password && "invalid"
                        }`}
                      type="password"
                      id="agent_password"
                      {...register("agent_password", {
                        required: "Agent Password is Required",
                        disabled: !watch("agent_email"),

                      })}
                      onKeyUp={() => {
                        trigger("agent_password");
                      }}
                    />

                    <p className="text-danger">{errors.agent_password?.message}</p>
                  </div>

                  <button
                    type="submit"
                    value="Submit"
                    className="btn btn-lg  mb-1"
                  >
                    Login
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
export default Login;
