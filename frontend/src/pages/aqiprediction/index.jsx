"use client";

import DashboardLayout from '@/layouts/dashboardLayout'
import UserLayout from '@/layouts/userLayout'
import React, { useState, useLayoutEffect, useRef } from 'react'
import axios from 'axios'
import styles from './index.module.css'
import gsap from 'gsap'

export default function AQIPrediction() {

  const heroRef = useRef(null)
  const mainRef = useRef(null)
  const numberRef = useRef(null)
  const adviceRef = useRef(null)

  const [city, setCity] = useState('')
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  //popup state
  const [popup, setPopup] = useState("")
  const [showPopup, setShowPopup] = useState(false)

  const showAlert = (message) => {
    setPopup(message)
    setShowPopup(true)

    setTimeout(() => {
      setShowPopup(false)
    }, 3000)
  }

  //hero animation

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".heroAnim", {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  //AQI color

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return "#22c55e"
    if (aqi <= 100) return "#eab308"
    if (aqi <= 200) return "#f97316"
    if (aqi <= 300) return "#ef4444"
    return "#7e22ce"
  }

  //typewriter

  const typeWriter = (text) => {
    if (!adviceRef.current) return
    adviceRef.current.innerHTML = ""

    text.split("").forEach((letter, index) => {
      const span = document.createElement("span")
      span.textContent = letter
      span.style.opacity = 0
      adviceRef.current.appendChild(span)

      gsap.to(span, {
        opacity: 1,
        delay: index * 0.02
      })
    })
  }

  //protect function with the validation

  const handlePredict = async () => {

    const trimmedCity = city.trim()

    if (!trimmedCity) {
      showAlert("Please enter a city name.")
      return
    }

    const cityRegex = /^[A-Za-z\s]+$/

    if (!cityRegex.test(trimmedCity)) {
      showAlert("City name should contain only letters.")
      return
    }

    try {

      setLoading(true)
      setError(null)
      setForecast(null)

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/forecast`,
        { city: trimmedCity }
      )

      if (!res.data.success) {
        showAlert(res.data.message || "City AQI forecast not available.")
        return
      }

      setForecast(res.data)

      mainRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start"
      })

      //aqi counter

      const counter = { val: 0 }

      gsap.to(counter, {
        val: res.data.prediction,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: () => {
          if (numberRef.current)
            numberRef.current.innerText = Math.floor(counter.val)
        }
      })

      typeWriter(res.data.healthAdvice)

    } catch (err) {

      console.error(err)

      if (err.response?.status === 404) {
        showAlert("City AQI forecast not found.")
      }

      else if (err.message === "Network Error") {
        showAlert("Server unreachable. Check internet connection.")
      }

      else {
        showAlert("Something went wrong. Please try again.")
      }

    } finally {
      setLoading(false)
    }
  }

  return (
    <UserLayout>
      <DashboardLayout>

        <div className={styles.wrapper}>

         
          {showPopup && (
            <div className={styles.popupAlert}>
              {popup}
            </div>
          )}

       
          <section ref={heroRef} className={styles.hero}>
            <h1 className="heroAnim">AeroVision Forecast Engine</h1>

            <h3 className="heroAnim">
              AI-Powered Future AQI Prediction
            </h3>

            <p className="heroAnim">
              Intelligent environmental forecasting powered by machine learning.
              Predict tomorrow’s air quality with clarity and confidence.
            </p>
          </section>

         
          <section ref={mainRef} className={styles.inputSection}>

            {error && (
              <div className={styles.errorBox}>
                {error}
              </div>
            )}

            
            {forecast && (
              <div
                className={styles.resultBox}
                style={{
                  borderColor: getAQIColor(forecast.prediction)
                }}
              >
                <h4>Predicted AQI for {forecast.city}</h4>

                <h1
                  ref={numberRef}
                  style={{ color: getAQIColor(forecast.prediction) }}
                >
                  0
                </h1>

                <h3 style={{ color: getAQIColor(forecast.prediction) }}>
                  {forecast.category}
                </h3>

                <p>
                  Trend: {forecast.trend} ({forecast.changePercent}%)
                </p>

                <p ref={adviceRef} className={styles.advice}>
                  {forecast.healthAdvice}
                </p>
              </div>
            )}

            <h2>Enter Your City</h2>

            <div className={styles.inputRow}>
              <input
                value={city}
                placeholder="Type city name..."
                onChange={(e) => {

                  const value = e.target.value

                  if (/^[A-Za-z\s]*$/.test(value)) {
                    setCity(value)
                  }

                }}
              />

              <button onClick={handlePredict} disabled={loading}>
                {loading ? "Predicting..." : "Predict AQI"}
              </button>
            </div>

            {!forecast && !error && (
              <h4 className={styles.placeholder}>
                No future AQI prediction yet. Search for a city to begin.
              </h4>
            )}

          </section>

        </div>

      </DashboardLayout>
    </UserLayout>
  )
}