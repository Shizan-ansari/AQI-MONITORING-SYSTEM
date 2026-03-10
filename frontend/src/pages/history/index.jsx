"use client";

import DashboardLayout from '@/layouts/dashboardLayout';
import UserLayout from '@/layouts/userLayout';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from "./index.module.css";

import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  Filler,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const getAQIDetails = (aqi) => {
  if (aqi <= 50) return { category: "Good", color: "#22c55e", impact: "Air quality is safe and healthy." };
  if (aqi <= 100) return { category: "Satisfactory", color: "#eab308", impact: "Minor breathing discomfort possible." };
  if (aqi <= 200) return { category: "Moderate", color: "#f97316", impact: "Sensitive groups may feel discomfort." };
  if (aqi <= 300) return { category: "Poor", color: "#ef4444", impact: "Breathing discomfort for most people." };
  if (aqi <= 400) return { category: "Very Poor", color: "#7e22ce", impact: "Respiratory illness risk on prolonged exposure." };
  return { category: "Severe", color: "#7f1d1d", impact: "Serious health impact. Avoid outdoor exposure." };
};

const POLLUTANT_INFO = {
  "PM2.5": { full: "Particulate Matter 2.5", desc: "Fine particles entering deep into lungs." },
  "PM10": { full: "Particulate Matter 10", desc: "Dust particles affecting breathing." },
  "NO₂": { full: "Nitrogen Dioxide", desc: "Vehicle emission gas affecting lungs." },
  "O₃": { full: "Ozone (Ground Level)", desc: "Irritates chest and causes coughing." },
  "SO₂": { full: "Sulfur Dioxide", desc: "Industrial gas causing throat irritation." },
  "CO": { full: "Carbon Monoxide", desc: "Reduces oxygen supply in bloodstream." }
};

export default function HistoryComponent() {

  const [city, setCity] = useState("pune");
  const [mode, setMode] = useState("daily");
  const [history, setHistory] = useState([]);
  const [last24h, setLast24h] = useState([]);
  const [dailyAverage5, setDailyAverage5] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      setHistory([]);
      setLast24h([]);
      setDailyAverage5([]);

      if (!city.trim()) {
        setError("Please enter a city name.");
        return;
      }

      if (mode === "daily") {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/get_aqi_history_graph?city=${city}`
        );
        if (!res.data.success) return setError(res.data.message);
        setHistory(res.data.data || []);
      } else {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/get_detailed_history?city=${city}`
        );
        if (!res.data.success) return setError(res.data.message);

        const hourly = res.data.fiveDayHourly || [];
        const last24 = res.data.last24Hours || [];

        setHistory(hourly);
        setLast24h(last24);

        const grouped = {};
        hourly.forEach(item => {
          const key = new Date(item.date).toISOString().split("T")[0];
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(item.aqi);
        });

        const averages = Object.keys(grouped).map(date => ({
          date,
          avg: Math.round(grouped[date].reduce((a,b)=>a+b,0)/grouped[date].length)
        }));

        setDailyAverage5(averages);
      }

    } catch {
      setError("Failed to fetch AQI data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [mode]);

  const dailyAQIChart = {
    labels: history.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [{
      data: history.map(item => item.aqi),
      borderColor: "#000",
      segment: {
        borderColor: ctx => getAQIDetails(ctx.p1.parsed.y).color
      },
      pointBackgroundColor: history.map(item => getAQIDetails(item.aqi).color),
      tension: 0.4,
      fill: false
    }]
  };

  const aqiOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.raw;
            const info = getAQIDetails(value);
            return [
              `Air Quality Index: ${value}`,
              `Condition: ${info.category}`,
              info.impact
            ];
          }
        }
      },
      legend: { display: false }
    }
  };

  const pollutantChart = {
    labels: history.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      { label: "PM2.5", data: history.map(item => item.pollutants?.pm2_5 ?? 0), backgroundColor: "#ef4444" },
      { label: "PM10", data: history.map(item => item.pollutants?.pm10 ?? 0), backgroundColor: "#f97316" },
      { label: "NO₂", data: history.map(item => item.pollutants?.no2 ?? 0), backgroundColor: "#3b82f6" },
      { label: "O₃", data: history.map(item => item.pollutants?.o3 ?? 0), backgroundColor: "#22c55e" },
      { label: "SO₂", data: history.map(item => item.pollutants?.so2 ?? 0), backgroundColor: "#a855f7" },
      { label: "CO", data: history.map(item => item.pollutants?.co ?? 0), backgroundColor: "#64748b" }
    ]
  };

  const pollutantOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const pollutant = ctx.dataset.label;
            const info = POLLUTANT_INFO[pollutant];
            return [
              `${pollutant} — ${info.full}`,
              `Concentration: ${ctx.raw} µg/m³`,
              info.desc
            ];
          }
        }
      }
    }
  };

  const avg5Chart = {
    labels: dailyAverage5.map(item => item.date),
    datasets: [{
      data: dailyAverage5.map(item => item.avg),
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59,130,246,0.2)",
      tension: 0.4,
      fill: true
    }]
  };

  const avg5Options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  const last24Chart = {
    labels: last24h.map(item => new Date(item.date).toLocaleTimeString()),
    datasets: [{
      data: last24h.map(item => item.aqi),
      borderColor: "#22c55e",
      backgroundColor: "rgba(34,197,94,0.2)",
      tension: 0.4,
      fill: true
    }]
  };

  const last24Options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  const showNoData = (dataArray) => dataArray.length === 0;

  return (
    <UserLayout>
      <DashboardLayout>

        <div className={styles.page}>

          <div className={styles.topBar}>
            <h2 className={styles.title}>AQI Intelligence Dashboard</h2>

            <div className={styles.switchContainer}>
              <button
                className={mode === "daily" ? styles.activeBtn : ""}
                onClick={() => setMode("daily")}
              >
                7 Day View
              </button>
              <button
                className={mode === "detailed" ? styles.activeBtn : ""}
                onClick={() => setMode("detailed")}
              >
                Detailed View
              </button>
            </div>
          </div>

          <section className={`${styles.hero} ${styles.fadeIn}`}>
            <h1>Environmental Intelligence Dashboard</h1>
            <p>Analyze AQI trends, pollutant distribution, and real-time air quality patterns.</p>
          </section>

          <div className={styles.searchBar}>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city"
              className={styles.cityInput}
            />
            <button onClick={fetchHistory} className={styles.searchBtn}>
              Search
            </button>
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}
          {loading && <p>Loading...</p>}

          {!loading && mode === "daily" && (
            <>
              
              <div className={styles.largeCard}>
                {showNoData(history) ? <div className={styles.noData}>Graph failed to load because no snapshot and no user search for this particular city on this platform.</div> : <Line data={dailyAQIChart} options={aqiOptions} />}
              </div>
              <div className={styles.largeCard}>
                {showNoData(history) ? <div className={styles.noData}>Graph failed to load</div> : <Bar data={pollutantChart} options={pollutantOptions} />}
              </div>
            </>
          )}

          {!loading && mode === "detailed" && (
            <>
            <h1>Real Time history for 6 days</h1>
              <div className={styles.largeCard}>
                {showNoData(dailyAverage5) ? <div className={styles.noData}>Graph failed to load</div> : <Line data={avg5Chart} options={avg5Options} />}
              </div>
              <h1>Last 24 hours history</h1>
              <div className={styles.largeCard}>
                {showNoData(last24h) ? <div className={styles.noData}>Graph failed to load</div> : <Line data={last24Chart} options={last24Options} />}
              </div>
            </>
          )}

        </div>

      </DashboardLayout>
    </UserLayout>
  );
}