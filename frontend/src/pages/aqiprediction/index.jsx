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
  const [error, setError] = useState(null)   // 🔥 NEW ERROR STATE

  /* HERO ANIMATION */

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

  /* AQI COLOR */

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return "#22c55e"
    if (aqi <= 100) return "#eab308"
    if (aqi <= 200) return "#f97316"
    if (aqi <= 300) return "#ef4444"
    return "#7e22ce"
  }

  /* TYPEWRITER */

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

  /* PREDICT FUNCTION WITH ERROR HANDLING */

  const handlePredict = async () => {
    if (!city.trim()) {
      setError("Please enter a city name.")
      return
    }

    try {
      setLoading(true)
      setError(null)
      setForecast(null)

      const res = await axios.post(
        "http://localhost:9090/forecast",
        { city }
      )

      if (!res.data.success) {
        setError(res.data.message)
        return
      }

      setForecast(res.data)

      mainRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start"
      })

      // Counter animation
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
      setError(
        err.response?.data?.message ||
        "Something went wrong. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <UserLayout>
      <DashboardLayout>

        <div className={styles.wrapper}>

          {/* HERO */}
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

          {/* INPUT + RESULT */}
          <section ref={mainRef} className={styles.inputSection}>

            {/* ERROR UI */}
            {error && (
              <div className={styles.errorBox}>
                {error}
              </div>
            )}

            {/* RESULT */}
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
                onChange={(e) => setCity(e.target.value)}
                placeholder="Type city name..."
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