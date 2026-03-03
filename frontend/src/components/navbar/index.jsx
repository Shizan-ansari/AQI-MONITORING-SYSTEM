import React, { useContext, useLayoutEffect, useRef } from 'react'
import styles from './index.module.css'
import { useRouter } from 'next/router'
import { AuthContext } from '@/context/authContext'
import gsap from 'gsap'

export default function NavbarComponent() {
  const router = useRouter()
  const { isLoggedIn, handleLogout } = useContext(AuthContext)

  const navRef = useRef(null)

  useLayoutEffect(() => {
    if (!navRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        navRef.current,
        { y: -80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className={styles.container} ref={navRef}>
      <nav className={styles.navbar}>
        <div className={styles.rightNav}>
          <h1 onClick={() => router.push("/")}>AeroVision</h1>
          <h2
  onClick={() => {
    if (!isLoggedIn) {
      alert("You need to login first to access the dashboard")
      router.push("/login")
    } else {
      router.push("/dashboard")
    }
  }}
>
  Dashboard
</h2>
        </div>

        <div className={styles.navbarOptionsContainer}>
          {isLoggedIn ? (
            <button className={styles.buttonLogin} onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className={styles.buttonLogin}
            >
              Login
            </button>
          )}
        </div>
      </nav>
    </div>
  )
}