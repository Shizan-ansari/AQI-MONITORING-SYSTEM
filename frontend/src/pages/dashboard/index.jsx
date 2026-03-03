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

  const introRef = useRef(null)
  const outputRef = useRef(null)
  const pollutantRefs = useRef([])

  const handleClick = async () => {
    setLoading(true)
    const data = await calculateAndGiveAIResponse(city.trim())
    setAqiData(data)
    setCity("")
    setLoading(false)
  }

  /* Intro animation */
  useEffect(() => {
    gsap.fromTo(
      introRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 }
    )
  }, [])

  /* Output animation */
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

  /* Typing */
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

          {/* PROFESSIONAL INTRO */}
          <div ref={introRef} className={styles.introSection}>
            <h1>Welcome to Your <br/>AQI Intelligence Dashboard</h1>
            <p>
              Analyze real-time air quality data, understand pollutant impact,
              and receive AI-powered health recommendations instantly.
            </p>
          </div>

          {/* INPUT */}
          <div className={styles.inputCard}>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name"
            />
            <br/>
            <button onClick={handleClick}>
              {loading ? "Analyzing..." : "Analyze AQI"}
            </button>
          </div>

          {/* OUTPUT */}
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

                {/* EXACT 3 PER ROW */}
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