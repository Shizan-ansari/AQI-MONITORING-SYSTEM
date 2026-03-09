"use client";

import React, { useEffect, useRef } from "react";
import styles from "./index.module.css";
import { useRouter, usePathname } from "next/navigation";
import gsap from "gsap";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const sidebarRef = useRef(null);
  
  //Route protection
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    }
  }, []);

  //GSAP Animation
  useEffect(() => {
    if (!sidebarRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        sidebarRef.current,
        { x: -80, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: "power3.out" }
      );
    });

    return () => ctx.revert();
  }, []);

  const handleHover = (e) => {
    gsap.to(e.currentTarget, {
      x: 8,
      scale: 1.05,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleLeave = (e) => {
    gsap.to(e.currentTarget, {
      x: 0,
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const isActive = (path) => pathname === path;

  //SAFE NAVIGATION FUNCTION
  const secureNavigation = (path) => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    router.push(path);
  };

  return (
    <div className={styles.container}>
      <div className={styles.homeContainer}>
        <div className={styles.homeContainer_leftBar} ref={sidebarRef}>
          <SidebarItem
            label="Dashboard"
            path="/dashboard"
            icon={dashboardIcon}
            navigate={secureNavigation}
            active={isActive("/dashboard")}
            onHover={handleHover}
            onLeave={handleLeave}
          />

          <SidebarItem
            label="Maps"
            path="/maps"
            icon={mapIcon}
            navigate={secureNavigation}
            active={isActive("/maps")}
            onHover={handleHover}
            onLeave={handleLeave}
          />

          <SidebarItem
            label="Travel Advisor"
            path="/advisor"
            icon={heartIcon}
            navigate={secureNavigation}
            active={isActive("/advisor")}
            onHover={handleHover}
            onLeave={handleLeave}
          />

          <SidebarItem
            label="AeroPredict"
            path="/aqiprediction"
            icon={predictionIcon}
            navigate={secureNavigation}
            active={isActive("/aqiprediction")}
            onHover={handleHover}
            onLeave={handleLeave}
          />

          <SidebarItem
            label="History"
            path="/history"
            icon={chartIcon}
            navigate={secureNavigation}
            active={isActive("/history")}
            onHover={handleHover}
            onLeave={handleLeave}
          />
        </div>

        <div className={styles.homeContainer_feedContainer}>
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ label, path, icon, navigate, active, onHover, onLeave }) {
  return (
    <div
      onClick={() => navigate(path)}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`${styles.sideBarOptions} ${active ? styles.active : ""}`}
    >
      {icon}
      <p>{label}</p>
    </div>
  );
}

/* Icons */

const dashboardIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="3" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="14" width="7" height="7" rx="2" />
    <rect x="3" y="14" width="7" height="7" rx="2" />
  </svg>
);

const mapIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M9 3l6 3 6-3v15l-6 3-6-3-6 3V6l6-3z" />
  </svg>
);

const heartIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 21s-8-4.5-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.5-8 11-8 11z" />
  </svg>
);

const predictionIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <polyline points="3 17 9 11 13 15 21 7" />
  </svg>
);

const chartIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <line x1="4" y1="19" x2="4" y2="10" />
    <line x1="12" y1="19" x2="12" y2="4" />
    <line x1="20" y1="19" x2="20" y2="14" />
  </svg>
);