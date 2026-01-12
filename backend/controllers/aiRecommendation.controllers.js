import { getDashboardAQIdata } from "../services/aiRecommendation.services.js";


export const getCityAIReview = async (req,res)=>{
    try {
        const {city} = req.body;
        
        const RecommendedData = await getDashboardAQIdata(city);

        return res.status(200).json({
            success: true,
            data: RecommendedData,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}