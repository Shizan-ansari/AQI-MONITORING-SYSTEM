import { AqiManipulationProvider } from "@/context/aqiCalculationContext";
import { AuthProvider } from "@/context/authContext";
import "@/styles/globals.css";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>AeroVision</title>
      </Head>

      <AqiManipulationProvider>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </AqiManipulationProvider>
    </>
  );
}