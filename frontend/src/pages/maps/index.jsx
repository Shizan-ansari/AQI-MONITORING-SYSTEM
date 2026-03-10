"use client";

import DashboardLayout from "@/layouts/dashboardLayout";
import UserLayout from "@/layouts/userLayout";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import mapboxgl from "mapbox-gl";
import polyline from "@mapbox/polyline";
import gsap from "gsap";
import "mapbox-gl/dist/mapbox-gl.css";
import styles from "./index.module.css";

export default function Index() {

  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);

  //popup alert state
  const [popup, setPopup] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const showAlert = (message) => {
    setPopup(message);
    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };

  const aqiMapRef = useRef(null);
  const aqiMapContainerRef = useRef(null);
  const markerRef = useRef(null);
  const isDraggedRef = useRef(false);

  const routeMapRef = useRef(null);
  const routeMapContainerRef = useRef(null);

  const heroRef = useRef(null);
  const routeHeroRef = useRef(null);
  const responseRef = useRef(null);

 //hero animation

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(heroRef.current, {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out"
      });

      gsap.from(routeHeroRef.current, {
        opacity: 0,
        y: 40,
        duration: 1,
        delay: 0.3,
        ease: "power3.out"
      });
    });

    return () => ctx.revert();
  }, []);

  //aqi map

  useEffect(() => {

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    const defaultCenter = [77.209, 28.6139];

    aqiMapRef.current = new mapboxgl.Map({
      container: aqiMapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: defaultCenter,
      zoom: 9,
    });

    aqiMapRef.current.on("load", async () => {
      await createMarker(defaultCenter);
      await updateAQI(defaultCenter[0], defaultCenter[1]);
    });

    aqiMapRef.current.on("moveend", async () => {
      if (!isDraggedRef.current) {
        const center = aqiMapRef.current.getCenter();
        await updateAQI(center.lng, center.lat);
      }
    });

    return () => aqiMapRef.current?.remove();

  }, []);

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return "#16a34a";
    if (aqi <= 100) return "#eab308";
    if (aqi <= 200) return "#f97316";
    if (aqi <= 300) return "#dc2626";
    return "#7c3aed";
  };

  const fetchAQIData = async (lat, lon) => {
    const res = await fetch(
  `${process.env.NEXT_PUBLIC_BACKEND_URL}/map?lat=${lat}&lon=${lon}`
);
    const json = await res.json();
    return json.data;
  };

  const createMarker = async (coords) => {
    const el = document.createElement("div");
    el.className = styles.pinWrapper;

    const label = document.createElement("div");
    label.className = styles.aqiLabel;
    label.innerText = "AQI ...";

    const pin = document.createElement("div");
    pin.className = styles.locationPin;

    el.appendChild(label);
    el.appendChild(pin);

    markerRef.current = new mapboxgl.Marker(el, { draggable: true })
      .setLngLat(coords)
      .addTo(aqiMapRef.current);

    markerRef.current.on("dragstart", () => {
      isDraggedRef.current = true;
    });

    markerRef.current.on("dragend", async () => {
      const lngLat = markerRef.current.getLngLat();
      await updateAQI(lngLat.lng, lngLat.lat);
    });
  };

  const updateAQI = async (lon, lat) => {

    //prevent null error 
    if (!markerRef.current) return;

    const feature = await fetchAQIData(lat, lon);
    if (!feature) return;

    const { aqi, category, pollutants } = feature.properties;

    const el = markerRef.current.getElement();
    const label = el.querySelector(`.${styles.aqiLabel}`);
    label.innerText = `AQI ${aqi}`;
    label.style.background = getAQIColor(aqi);

    markerRef.current.setPopup(
      new mapboxgl.Popup({ offset: 40 }).setHTML(`
        <div class="${styles.popupCard}">
          <div class="${styles.popupHeader}">
            <div class="${styles.popupAqiCircle}" style="background:${getAQIColor(aqi)}">${aqi}</div>
            <div>
              <h3>AQI Level</h3>
              <p>${category}</p>
            </div>
          </div>
          <div class="${styles.popupBody}">
            <div class="${styles.pollutantItem}">
              <span>PM2.5</span>
              <strong>${pollutants.pm2_5}</strong>
            </div>
            <div class="${styles.pollutantItem}">
              <span>PM10</span>
              <strong>${pollutants.pm10}</strong>
            </div>
          </div>
        </div>
      `)
    );
  };

  //route search with validation

  const handleSearch = async () => {

    const sourceCity = source.trim();
    const destinationCity = destination.trim();

    const cityRegex = /^[A-Za-z\s]+$/;

    if (!sourceCity || !destinationCity) {
      showAlert("Please enter both source and destination cities.");
      return;
    }

    if (!cityRegex.test(sourceCity) || !cityRegex.test(destinationCity)) {
      showAlert("City names should contain only letters.");
      return;
    }

    try {

      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/clean-route`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source: sourceCity, destination: destinationCity })
        }
      );

      const json = await res.json();

      if (!json.success) {
        showAlert("Unable to calculate route. Try another city.");
        return;
      }

      setRouteData(json);

      gsap.from(responseRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out"
      });

    } catch (err) {

      console.error(err);

      showAlert("Server error. Please try again later.");

    } finally {
      setLoading(false);
    }
  };

  //Route Map

  useEffect(() => {

    if (!routeData) return;

    if (routeMapRef.current) routeMapRef.current.remove();

    routeMapRef.current = new mapboxgl.Map({
      container: routeMapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      zoom: 6,
      center: [77.209, 28.6139]
    });

    routeMapRef.current.on("load", () => {

      const coordinates = polyline
        .decode(routeData.geometry)
        .map(coord => [coord[1], coord[0]]);

      routeMapRef.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: { type: "LineString", coordinates }
        }
      });

      routeMapRef.current.addLayer({
        id: "routeLayer",
        type: "line",
        source: "route",
        paint: {
          "line-color": "#2563eb",
          "line-width": 6
        }
      });

      routeMapRef.current.fitBounds(coordinates, { padding: 80 });
    });

  }, [routeData]);

  return (
    <UserLayout>
      <DashboardLayout>

        <div className={styles.pageWrapper}>

          {showPopup && (
            <div className={styles.popupAlert}>
              {popup}
            </div>
          )}

          <div ref={heroRef} className={styles.introSection}>
            <h1>AQI Location Intelligence</h1>
            <p>
              Move the map to explore air quality or drag the red pin
              to analyze a specific location instantly.
            </p>
          </div>

          <div className={styles.mapContainer}>
            <div ref={aqiMapContainerRef} className={styles.map} />
          </div>

          <section className={styles.routeFeatureSection}>

            <div ref={routeHeroRef} className={styles.routeHero}>
              <h2>Pollution-Aware Smart Route Planner</h2>
              <p>
                Enter your source and destination to calculate the healthiest
                route with the lowest average AQI exposure.
              </p>
            </div>

            <div className={styles.routeInputBoxNew}>

              <input
                placeholder="Enter Source City"
                value={source}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[A-Za-z\s]*$/.test(value)) setSource(value);
                }}
              />

              <input
                placeholder="Enter Destination City"
                value={destination}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[A-Za-z\s]*$/.test(value)) setDestination(value);
                }}
              />

              <button onClick={handleSearch}>
                {loading ? "Analyzing..." : "Find Cleanest Route"}
              </button>

            </div>

            {routeData && (
              <>
                <div ref={responseRef} className={styles.routeInfoCard}>
                  <h3>Recommended Route Summary</h3>
                  <p>{routeData.message}</p>

                  <div className={styles.routeStatsNew}>
                    <div>
                      <span>Distance</span>
                      <strong>{routeData.distance} km</strong>
                    </div>
                    <div>
                      <span>Duration</span>
                      <strong>{routeData.duration} mins</strong>
                    </div>
                    <div>
                      <span>Average AQI</span>
                      <strong>{routeData.averageAQI}</strong>
                    </div>
                  </div>
                </div>

                <div className={styles.mapContainer}>
                  <div ref={routeMapContainerRef} className={styles.map} />
                </div>
              </>
            )}

          </section>

        </div>

      </DashboardLayout>
    </UserLayout>
  );
}