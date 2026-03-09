"use client";

import DashboardLayout from "@/layouts/dashboardLayout";
import UserLayout from "@/layouts/userLayout";
import React, { useState, useEffect } from "react";

function Field({ label, children, center }) {
  const cardStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "1rem",
    borderRadius: "14px",
    background: "#f8fcff",
    border: "1px solid #d6efff",
    minHeight: "120px",
    transition: "0.25s ease"
  };

  return (
    <div style={{ ...cardStyle, gridColumn: center ? "2 / 3" : "auto" }}>
      <label style={{ fontWeight: 600, color: "#0277bd" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function TravelAdvisor() {

  const [formData, setFormData] = useState({
    destination: "",
    ageGroup: "",
    healthConditions: "none",
    outdoorExposure: "",
    activityIntensity: "",
    airPurifier: "false",
    maskType: "none",
    aqiAwareness: "",
    canPostponeTravel: "false",
    recommendationDetail: "standard"
  });

  const [recommendation, setRecommendation] = useState(null);
  const [typedText, setTypedText] = useState("");
  const [loading, setLoading] = useState(false);

  //POPUP ALERT
  const [popup, setPopup] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const showAlert = (message) => {
    setPopup(message);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  const handleChange = (e) => {

    const { name, value } = e.target;

    //DESTINATION VALIDATION
    if (name === "destination") {
      const regex = /^[A-Za-z\s]*$/;

      if (!regex.test(value)) {
        showAlert("City name should contain only letters.");
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // BACKEND REQUIRED FIELD VALIDATION 

    if (!formData.destination.trim()) {
      showAlert("Destination city is required.");
      return;
    }

    if (!formData.ageGroup) {
      showAlert("Age group is required.");
      return;
    }

    if (!formData.outdoorExposure) {
      showAlert("Outdoor exposure is required.");
      return;
    }

    if (!formData.activityIntensity) {
      showAlert("Activity intensity is required.");
      return;
    }

    if (!formData.maskType) {
      showAlert("Mask type is required.");
      return;
    }

    if (!formData.aqiAwareness) {
      showAlert("AQI awareness level is required.");
      return;
    }

    if (!formData.canPostponeTravel) {
      showAlert("Please specify if travel can be postponed.");
      return;
    }

    setLoading(true);
    setRecommendation(null);
    setTypedText("");

    try {

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/get_travel_recommendation?${new URLSearchParams(formData)}`
      );

      if (!response.ok) {
        showAlert("Unable to generate recommendation.");
        return;
      }

      const data = await response.json();

      if (!data?.data?.aiAdvice) {
        showAlert("No recommendation available for this destination.");
        return;
      }

      setRecommendation(data);

    } catch (err) {

      console.error(err);
      showAlert("Server error. Please try again later.");

    } finally {
      setLoading(false);
    }
  };

useEffect(() => {

  if (!recommendation?.data?.aiAdvice) return;

  const text = recommendation.data.aiAdvice;
  let i = 0;

  const interval = setInterval(() => {

    if (i > text.length) {
      clearInterval(interval);
      return;
    }

    setTypedText(text.slice(0, i));
    i++;

  }, 15);

  return () => clearInterval(interval);

}, [recommendation]);
  // STYLES 

  const pageStyle = {
    minHeight: "100vh",
    padding: "3rem 2rem",
    background: "linear-gradient(135deg,#e0f7ff,#b3e5fc,#81d4fa)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  };

  const formStyle = {
    width: "100%",
    maxWidth: "1100px",
    display: "grid",
    marginBottom: "15px",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1.2rem",
    padding: "2rem",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.95)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.1)"
  };

  const inputStyle = {
    padding: "0.6rem",
    borderRadius: "8px",
    border: "1px solid #b3e5fc",
    fontSize: "0.95rem",
    outline: "none",
    background: "white",
    width: "100%"
  };

  const buttonStyle = {
    gridColumn: "1 / -1",
    padding: "1rem",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(to right,#0288d1,#01579b)",
    color: "white",
    fontSize: "1.05rem",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "0.5rem"
  };

  const responseStyle = {
    marginBottom: "2rem",
    maxWidth: "1100px",
    width: "100%",
    padding: "2rem",
    borderRadius: "18px",
    background: "#f0fbff",
    border: "1px solid #cdefff",
    boxShadow: "0 15px 40px rgba(0,0,0,0.07)"
  };

  const popupStyle = {
    position: "fixed",
    top: "30px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#ef4444",
    color: "white",
    padding: "12px 25px",
    borderRadius: "10px",
    fontWeight: "600",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    zIndex: 9999
  };

  return (
    <UserLayout>
      <DashboardLayout>

        <div style={pageStyle}>

          {showPopup && (
            <div style={popupStyle}>{popup}</div>
          )}

          <h1 style={{
            fontSize: "2.5rem",
            fontWeight: "800",
            marginBottom: "2rem",
            background: "linear-gradient(to right,#0288d1,#01579b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            ✈️ AI Travel AQI Advisor
          </h1>

          <form style={formStyle} onSubmit={handleSubmit}>

            <Field label="Destination City">
              <input
                style={inputStyle}
                name="destination"
                type="text"
                value={formData.destination}
                onChange={handleChange}
              />
            </Field>

            {/* Remaining fields unchanged */}

            <Field label="Age Group">
              <select style={inputStyle} name="ageGroup" value={formData.ageGroup} onChange={handleChange}>
                <option value="">Select</option>
                <option value="child">Child</option>
                <option value="adult">Adult</option>
                <option value="senior">Senior</option>
              </select>
            </Field>

            <Field label="Health Conditions">
              <select style={inputStyle} name="healthConditions" value={formData.healthConditions} onChange={handleChange}>
                <option value="none">None</option>
                <option value="asthma">Asthma</option>
                <option value="copd">COPD</option>
                <option value="heart">Heart Issue</option>
              </select>
            </Field>

            <Field label="Outdoor Exposure">
              <select style={inputStyle} name="outdoorExposure" value={formData.outdoorExposure} onChange={handleChange}>
                <option value="">Select</option>
                <option value="<1hr">&lt; 1 hour</option>
                <option value="1-3hr">1–3 hours</option>
                <option value=">3hr">&gt; 3 hours</option>
              </select>
            </Field>

            <Field label="Activity Intensity">
              <select style={inputStyle} name="activityIntensity" value={formData.activityIntensity} onChange={handleChange}>
                <option value="">Select</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="heavy">Heavy</option>
              </select>
            </Field>

            <Field label="Air Purifier">
              <select style={inputStyle} name="airPurifier" value={formData.airPurifier} onChange={handleChange}>
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </Field>

            <Field label="Mask Type">
              <select style={inputStyle} name="maskType" value={formData.maskType} onChange={handleChange}>
                <option value="none">No mask</option>
                <option value="cloth">Cloth</option>
                <option value="n95">N95</option>
                <option value="n99">N99</option>
              </select>
            </Field>

            <Field label="AQI Awareness">
              <select style={inputStyle} name="aqiAwareness" value={formData.aqiAwareness} onChange={handleChange}>
                <option value="">Select</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </Field>

            <Field label="Can Postpone">
              <select style={inputStyle} name="canPostponeTravel" value={formData.canPostponeTravel} onChange={handleChange}>
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </Field>

            <Field label="Recommendation Detail" center>
              <select style={inputStyle} name="recommendationDetail" value={formData.recommendationDetail} onChange={handleChange}>
                <option value="short">Short</option>
                <option value="standard">Standard</option>
                <option value="detail">Detailed</option>
              </select>
            </Field>

            <button style={buttonStyle} type="submit">
              {loading ? "Loading..." : "Get AI Recommendation"}
            </button>

          </form>

          {typedText && (
            <div style={responseStyle}>
              <h3 style={{ color: "#01579b" }}>🤖 AI Recommendation</h3>
              <p style={{ marginTop: "1rem", lineHeight: "1.8" }}>
                {typedText}
              </p>
            </div>
          )}

        </div>

      </DashboardLayout>
    </UserLayout>
  );
}