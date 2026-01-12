import { getAndStoreAQiDataByCity } from "../services/aqi.services.js";


export const getAqiByCity = async(req,res) =>{
    try {
        const {city} = req.body;
        if(!city){
            return res.status(400).json({message: "City Name is required"})
        }

        const AqiData = await getAndStoreAQiDataByCity(city);
        res.status(200).json(AqiData);
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}