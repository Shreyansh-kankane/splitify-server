import User from '../models/UserModel.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import UserOTPVerification from '../models/UserOTPVerification.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import Group from '../models/GroupModel.js';

dotenv.config();

const signup = async (req, res) => {

    try {
        let { name, email, password } = req.body;
        name = name.trim();
        email = email.trim();
        password = password.trim();

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        else if (!/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/.test(email)) {
            return res.status(400).json({ error: 'Invalid email' });
        }
        else if (!/^[a-zA-Z0-9]{6,}$/.test(password)) {
            return res.status(400).json({ error: 'Password must be atleast 6 characters long' });
        }
        else if (!/^[a-zA-Z]{3,}$/.test(name)) {
            return res.status(400).json({ error: 'Name must be atleast 3 characters long' });
        }
        else {
            const user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ error: 'User already exists' });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            total_owed: 0,
            isVerified: false
        })
        await newUser.save();

        await sendOTPVerification(newUser, req,res);
        
    } catch (error) {
        res.status(500).json({
            status: 'FAILED',
            error: "Internal server error"
        });
    }
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.AUTH_EMAIL, 
        pass: process.env.AUTH_PASS 
    }
});


const sendOTPVerification = async ( user, req,res )=>{
    try {
        const otp = Math.floor(1000 + Math.random() * 9000);
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: user.email,
            subject: 'OTP Verification',
            html: `
            <h2>Welcome ${user.name}, Your OTP is ${otp} </h2> 
            <br />
            Enter this OTP to verify your account 
            <p>Do not share this OTP with anyone</p>
            <br />
            Your OTP will expire in 10 minutes
            `
            
        };

        const salt = await bcrypt.genSalt(10);
        const hashedOTP = await bcrypt.hash(otp.toString(), salt);
        const newOTPVerification = new UserOTPVerification({
            userId: user._id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 600000
        });
        
        await newOTPVerification.save();
        await transporter.sendMail(mailOptions);

        res.json({ 
            status: 'PENDING',
            message: 'OTP sent successfully', 
            data: {
                userId: user._id,
                email: user.email
            }
        });
    }
    catch (error) {
        res.status(500).json({ 
            status: 'FAILED',
            error: error.message 
        });
    }
}

const verifyOTP = async (req, res) => {
    try {
        const { userId, otp } = req.body;
        if(!userId || !otp){
            return res.status(400).json({ error: 'All fields are required' });
        }
    
        const UserOTPVerificationRecord = await UserOTPVerification.findOne({ userId }).sort({ createdAt: -1 });

        if (!UserOTPVerificationRecord) {
            return res.status(400).json({ error: 'OTP not found' });
        }
        else if (UserOTPVerificationRecord.expiresAt < Date.now()) {
            await UserOTPVerificationRecord.deleteOne({ _id: userId });
            return res.status(400).json({ error: 'OTP expired' });
        }
        const isMatch = await bcrypt.compare(otp, UserOTPVerificationRecord.otp);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }
        else {
            await User.updateOne({ _id: userId }, { isVerified: true });
            await UserOTPVerificationRecord.deleteOne({ _id: userId });

            // create non-expense group for user
            const newGroup = new Group({
                name: 'Non-Expense Group',
                total_owed: 0,
                admin: userId,
                users: [userId],
                currencyType: 'INR',
                type: 'Other'
            })

            await newGroup.save();
            await User.updateOne({ _id: userId }, { $push: { groups: { group_id: newGroup._id, balance: 0 } } });

            return res.json({ status: 'SUCCESS', message: 'OTP verified successfully' });
        }

    } catch (error) {
        res.status(500).json({
            status: 'FAILED',
            error: error.message
        });
    }
}

const resendOTP = async (req, res) => {
    try {
        const { userId,email } = req.body;
        if(!userId || !email){
            return res.status(400).json({ error: 'User details is required' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }
        await UserOTPVerification.deleteOne({ _id: userId });
        await sendOTPVerification(user,req,res);
    }       
    catch (error) {
        res.status(500).json({
            status: 'FAILED',
            error: "Internal server error"
        });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (!user) return res.status(400).json({ msg: "User does not exist. " });

        const isVerified = user.isVerified;
        if (!isVerified) return res.status(400).json({ msg: "User is not verified. " });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

        const token = jwt.sign({ 
            id: user._id,
            name: user.name,
            email: user.email,
         }, process.env.JWT_SECRET);
        res.status(200).json({ token, user });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createUserWithGoogleSignIn = async (req, res) => {
    try {   
        const { name, email, imageUrl } = req.body;

        const user = await User.findOne({email});
        if(user){
            return res.status(200).json(user);
        }
        const newUser = new User({
            name,
            email,
            imageUrl,
            contact: "",
            total_owed: 0,
        });
        await user.save();
        return res.status(200).json(newUser);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const changePasswordReq = async (req,res) => {
    try {
        const {email} = req.body;
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '20m' });
        const data = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: 'Reset Password Request',
            html: `
                <h2>Please click on the link to reset your password</h2>
                <p>http://localhost:4000/user/resetPassword/${token}</p>
                <p>Do not share with anyone.</p>
            `
        }
        await transporter.sendMail(data);
        res.json({ message: 'Reset Password Email sent successfully' });

    } catch (error) {
        
    }
}

const resetPassword = async (req,res) => {
    const token = req.params.token;
    console.log(token)
    if(!token){
        return res.status(400).json({ error: 'Invalid token' });
    }
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
        if(err){
            return res.status(400).json({ error: 'Incorrect or expired link' });
        }
        const { email } = decodedToken;
        const { password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'User does not exist' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await User.updateOne({ email }, { password: hashedPassword });
        res.json({ message: 'Password updated successfully' });
    })
}


export { signup,verifyOTP,resendOTP,login,createUserWithGoogleSignIn,changePasswordReq,resetPassword }
