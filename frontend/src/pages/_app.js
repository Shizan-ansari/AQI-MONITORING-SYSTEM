import { AqiManipulationProvider } from "@/context/aqiCalculationContext";
import { AuthContext, AuthProvider } from "@/context/authContext";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Orbitron:wght@600;800&display=swap" rel="stylesheet" />
  return (
    
    <AqiManipulationProvider>
      <AuthProvider>
      <Component {...pageProps} />
      </AuthProvider>
    </AqiManipulationProvider>
  )
}
