"use client";

import { useContext, useRef, useState } from "react";
import { AqiManipulationContext } from "../context/aqiCalculationContext";
import UserLayout from "@/layouts/userLayout";
import styles from "@/styles/Home.module.css";

export default function Home() {
  const { city, setCity, calculateAqiAndGiveResponse } =
    useContext(AqiManipulationContext);

  const [aqiData, setAqiData] = useState(null);
  const [error, setError] = useState("");
  const calculatorRef = useRef(null);

  const handleClick = async () => {
    if (!city || city.trim() === "") {
      setError("Please enter a city name");
      return;
    }

    try {
      setError("");
      const data = await calculateAqiAndGiveResponse(city.trim());
      setAqiData(data);
      calculatorRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch {
      setError("Unable to fetch AQI right now.");
    }
  };

  const pollutants = aqiData?.latestAQI?.pollutants;

  return (
    <UserLayout>
      {/* HERO SECTION */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>AeroVision</h1>
        <p className={styles.heroSubtitle}>
          AQI Monitoring System with Intelligent Air Insights for Modern Living
        </p>
        <p className={styles.heroText}>
          From real-time AQI tracking and smart clean-route navigation to AI travel recommendations, predictive air insights, and historical analysis — AeroVision helps you move smarter and breathe safer
        </p>
      </section>

      {/* CALCULATOR SECTION */}
      <section ref={calculatorRef} className={styles.calculatorSection}>
        {/* RESPONSE */}
        {aqiData?.latestAQI && (
          <div className={styles.responseCard}>
            <h3 className={styles.responseTitle}>
              Air Quality in {aqiData.latestAQI.city}
            </h3>

            <div className={styles.aqiBadge}>
              AQI {aqiData.latestAQI.aqi.value} –{" "}
              {aqiData.latestAQI.aqi.category}
            </div>

            {/* POLLUTANTS */}
            <div className={styles.pollutantsGrid}>
              <div className={`${styles.pollutantCard} ${styles.pm25}`}>
                <h4>PM2.5</h4>
                <p className={styles.meaning}>
                  Fine particles that penetrate deep into lungs
                </p>
                <span className={styles.value}>{pollutants.pm2_5}</span>
              </div>

              <div className={`${styles.pollutantCard} ${styles.pm10}`}>
                <h4>PM10</h4>
                <p className={styles.meaning}>
                  Dust & smoke particles affecting airways
                </p>
                <span className={styles.value}>{pollutants.pm10}</span>
              </div>

              <div className={`${styles.pollutantCard} ${styles.no2}`}>
                <h4>NO₂</h4>
                <p className={styles.meaning}>
                  Vehicle & industrial emissions
                </p>
                <span className={styles.value}>{pollutants.no2}</span>
              </div>

              <div className={`${styles.pollutantCard} ${styles.so2}`}>
                <h4>SO₂</h4>
                <p className={styles.meaning}>
                  Industrial gas causing breathing issues
                </p>
                <span className={styles.value}>{pollutants.so2}</span>
              </div>

              <div className={`${styles.pollutantCard} ${styles.o3}`}>
                <h4>O₃</h4>
                <p className={styles.meaning}>
                  Ground-level ozone causing chest pain
                </p>
                <span className={styles.value}>{pollutants.o3}</span>
              </div>

              <div className={`${styles.pollutantCard} ${styles.co}`}>
                <h4>CO</h4>
                <p className={styles.meaning}>
                  Reduces oxygen supply in the body
                </p>
                <span className={styles.value}>{pollutants.co}</span>
              </div>
            </div>
          </div>
        )}

        <h2 className={styles.sectionTitle}>Check Your City AQI</h2>

        <div className={styles.calculatorCard}>
          <input
            className={styles.cityInput}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name"
          />
          <button className={styles.primaryBtn} onClick={handleClick}>
            Get AQI
          </button>
          {error && <p className={styles.errorText}>{error}</p>}
        </div>

        
      </section>
    </UserLayout>
  );
}
