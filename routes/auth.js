const express=require("express");
const User=require("../models/User");
const generateToken=require("../utils/generateToken");
const router=express.Router();

router.post('/register',async(req,res)=>{
    const {email,password}=req.body;

    try{
        const exists=await User.findOne({email});
        if(exists) return res.status(400).json({message:"User already exists"});

        const user=await User.create({email,password});
        const token=user.generateToken(user._id);

        res.status(201).json({token,user: {id:user._id,email:user.email}});

    }
    catch(err){
        res.status(500).json({message:"Server error"});
    }
})

router.post("/login",async(req,res)=>{

    const {email,password}=req.body;

    try{
        const exists=await User.findOne({email});
        if(!exists || !(await user.comparePassword(password)))
            return res.status(401).json({message:"invalid credentials"});

        const token=generateToken(user._id);
        res.json({token,user:{id:user._id,email:user.email}})
    }
    catch(err){
        return res.status(500).json({message:"server error"});
    }
})

module.exports=router;