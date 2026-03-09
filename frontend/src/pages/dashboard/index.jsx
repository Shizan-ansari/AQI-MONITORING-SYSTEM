import DashboardLayout from '@/layouts/dashboardLayout'
import UserLayout from '@/layouts/userLayout'
import React, { useContext, useEffect, useRef, useState } from 'react'
import styles from './index.module.css'
import { AqiManipulationContext } from '@/context/aqiCalculationContext'
import gsap from 'gsap'

const pollutantInfo = {
  pm2_5: { label: "PM2.5", desc: "Fine lung particles", color: "#fde68a" },
  pm10: { label: "PM10", desc: "Dust particles", color: "#fed7aa" },
  no2: { label: "NO₂", desc: "Vehicle emissions", color: "#fbcfe8" },
  so2: { label: "SO₂", desc: "Industrial gas", color: "#e9d5ff" },
  o3: { label: "O₃", desc: "Ground ozone", color: "#bfdbfe" },
  co: { label: "CO", desc: "Reduces oxygen", color: "#c7d2fe" },
}

export default function Dashboard() {

  const { city, setCity, calculateAndGiveAIResponse } =
    useContext(AqiManipulationContext)

  const [aqiData, setAqiData] = useState(null)
  const [typedText, setTypedText] = useState("")
  const [loading, setLoading] = useState(false)

 //popup state
  const [popup, setPopup] = useState("")
  const [showPopup, setShowPopup] = useState(false)

  const introRef = useRef(null)
  const outputRef = useRef(null)
  const pollutantRefs = useRef([])

  //popup function
  const showAlert = (message) => {
    setPopup(message)
    setShowPopup(true)

    setTimeout(() => {
      setShowPopup(false)
    }, 3000)
  }

  const handleClick = async () => {

    const trimmedCity = city.trim()

    //validation
    if (!trimmedCity) {
      showAlert("Please enter a city name")
      return
    }

    const cityRegex = /^[A-Za-z\s]+$/

    if (!cityRegex.test(trimmedCity)) {
      showAlert("City name should contain only letters")
      return
    }

    try {

      setLoading(true)

      const data = await calculateAndGiveAIResponse(trimmedCity)

      if (!data?.data) {
        showAlert("Invalid city or no AQI data available")
        return
      }

      setAqiData(data)
      setCity("")

    } catch (err) {

      console.error(err)

      if (err.response?.status === 500) {
        showAlert("Invalid city name. Please try a real city.")
      }

      else if (err.message === "Network Error") {
        showAlert("Server unreachable. Check internet connection.")
      }

      else {
        showAlert("Something went wrong. Try again later.")
      }

    } finally {
      setLoading(false)
    }
  }

  //Intro animation
  useEffect(() => {
    gsap.fromTo(
      introRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 }
    )
  }, [])

  //output animation
  useEffect(() => {
    if (aqiData?.data) {
      gsap.fromTo(
        outputRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 }
      )

      gsap.fromTo(
        pollutantRefs.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.12, duration: 0.5 }
      )
    }
  }, [aqiData])

  //typing animation
  useEffect(() => {
    if (aqiData?.data?.recommendation) {

      let text = aqiData.data.recommendation
      let i = 0
      setTypedText("")

      const interval = setInterval(() => {
        setTypedText(text.slice(0, i))
        i++
        if (i > text.length) clearInterval(interval)
      }, 18)

      return () => clearInterval(interval)
    }
  }, [aqiData])

  const getAqiColor = (value) => {
    if (value <= 50) return "#22c55e"
    if (value <= 100) return "#eab308"
    if (value <= 200) return "#f97316"
    if (value <= 300) return "#ef4444"
    return "#7c3aed"
  }

  return (
    <UserLayout>
      <DashboardLayout>

        <div className={styles.pageWrapper}>

          {/* POPUP */}
          {showPopup && (
            <div className={styles.popupAlert}>
              {popup}
            </div>
          )}

          <div ref={introRef} className={styles.introSection}>
            <h1>Welcome to Your <br/>AQI Intelligence Dashboard</h1>
            <p>
              Analyze real-time air quality data, understand pollutant impact,
              and receive AI-powered health recommendations instantly.
            </p>
          </div>

          <div className={styles.inputCard}>
            <input
              value={city}
              placeholder="Enter city name"

              /* INPUT FILTER */
              onChange={(e) => {
                const value = e.target.value

                if (/^[A-Za-z\s]*$/.test(value)) {
                  setCity(value)
                }
              }}
            />

            <br/>

            <button onClick={handleClick}>
              {loading ? "Analyzing..." : "Analyze AQI"}
            </button>
          </div>

          {aqiData?.data && (
            <div className={styles.outputWrapper}>
              <div ref={outputRef} className={styles.outputCard}>

                <h2 className={styles.cityName}>
                  {aqiData.data.city.toUpperCase()}
                </h2>

                <div
                  className={styles.aqiValue}
                  style={{ backgroundColor: getAqiColor(aqiData.data.aqi.value) }}
                >
                  AQI {aqiData.data.aqi.value}
                </div>

                <div className={styles.pollutantGrid}>
                  {Object.entries(aqiData.data.pollutants).map(
                    ([key, value], index) => {
                      const info = pollutantInfo[key]
                      return (
                        <div
                          key={key}
                          ref={(el) => (pollutantRefs.current[index] = el)}
                          className={styles.pollutantCard}
                          style={{ backgroundColor: info.color }}
                        >
                          <h4>{info.label}</h4>
                          <strong>{value}</strong>
                          <p>{info.desc}</p>
                        </div>
                      )
                    }
                  )}
                </div>

                <div className={styles.recommendationBox}>
                  <h3>Health Recommendation</h3>
                  <p>{typedText}<span className={styles.cursor}>|</span></p>
                </div>

              </div>
            </div>
          )}

        </div>

      </DashboardLayout>
    </UserLayout>
  )
}