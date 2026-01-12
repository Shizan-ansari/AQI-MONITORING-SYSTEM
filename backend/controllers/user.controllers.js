import User from "../models/user.model.js";
import crypto from "crypto";
import bcrypt from "bcrypt";


export const register = async (req,res) => {

    try {
        const {username, email, password} = req.body;

        if( !username, !email, !password){
            res.status(400).json({message: "All fields are required"})
        }
        
        const user = await User.findOne({email});
        if(user){
            res.status(400).json({message: "User already exist"})
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = new User({
            username,
            email,            
            password: hashedPassword
        })

        await newUser.save();

        return res.json({message: "User Created"})

    } catch (error) {
        return res.status(500).json({message: error.message})
    }
    
}

export const login = async (req,res) =>{
    try {
        const {email, password} = req.body;
        if(!email || !password) {
            res.status(500).json({message: "All fields are required"})
        }

        const user = await User.findOne({email});
        if(!user){
            res.status(404).json({message: "User not found"})
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            res.status(400).json({message: "Password is Incorrect or Invalid Credentials"})
        }

        const token = crypto.randomBytes(32).toString("hex");
        await User.updateOne({_id: user._id},{token});

        return res.json({token});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}