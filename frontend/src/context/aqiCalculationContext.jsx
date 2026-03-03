"use client"
import { useRouter } from "next/router";
import { createContext, useContext, useState } from "react";
import httpStatus from "http-status"

const {default: axios, HttpStatusCode} = require("axios");


export const  AqiManipulationContext = createContext({});

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL
});

export const AqiManipulationProvider = ({children}) =>{


    const [city, setCity] = useState("");

    const calculateAqiAndGiveResponse = async(city) =>{
        try {
            let request = await client.post("/get_aqi_by_city",{city});
            if(request.status === httpStatus.OK){
                return request.data;
            }

        } catch (error) {
            throw(error)
        }
    }
    const calculateAndGiveAIResponse = async(city) =>{
        try {
            let request = await client.post("/dashboard/ai_recommeded_response", {city});
            if(request.status === httpStatus.OK){
                return request.data;
            }
        } catch (error) {
            throw(error)
        }
    }

    const data = {
        city,setCity,calculateAqiAndGiveResponse, calculateAndGiveAIResponse
    }

     return(
        <AqiManipulationContext.Provider
      value={{
        city,
        setCity,
        calculateAqiAndGiveResponse,
        calculateAndGiveAIResponse
      }}
    >
      {children}
    </AqiManipulationContext.Provider>
    )
}