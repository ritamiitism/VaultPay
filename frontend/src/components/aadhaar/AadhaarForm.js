import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from '../shared/Loader';
import "./Aadhaar.css";

const api = process.env.REACT_APP_API;

function AadhaarForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [loading, setLoading] = useState(false);

  async function onSubmit(data) {
    if (!/^\d{12}$/.test(data.aadhaar)) {
      toast.error("Please enter a valid 12-digit Aadhaar number");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `${api}/user/verify-aadhaar/${userId}`,
        {
          aadhaar: data.aadhaar
        },
        {
          withCredentials: true,
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        }
      );

      const { success, message, isVerified } = response.data;
      if (!success) {
        toast.error(message);
        setLoading(false);
        return;
      }
      toast.success(message);
      localStorage.setItem("isVerified", String(isVerified));
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 2000);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Axios error:", error);
      toast.error(error.response?.data?.message || "Aadhaar verification failed");
    }
  }

  return (
    <section className="aadhaarform">
      <form className="aadhaar-form" onSubmit={handleSubmit(onSubmit)}>
        <h2>Enter your Aadhaar Number</h2>
        <p>For demo purposes only — use any 12-digit number.</p>
        <input
          {...register("aadhaar", {
            required: true,
            pattern: /^\d{12}$/
          })}
          type="text"
          placeholder="Enter 12-digit Aadhaar"
          maxLength={12}
          required
        />
        {loading ? <Loader /> : <button type="submit">Submit</button>}
        {errors.aadhaar && <p className="">Please enter a valid 12-digit Aadhaar number</p>}
      </form>
    </section>
  );
}

export default AadhaarForm;
