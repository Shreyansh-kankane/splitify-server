import express from "express";

import { signup,verifyOTP,resendOTP,login,createUserWithGoogleSignIn,changePasswordReq,resetPassword } from "../controllers/auth.js";

const router = express.Router();

router.post('/signup', signup);
router.post('/verifyOTP', verifyOTP);
router.post('/resendOTP', resendOTP);
router.post('/login', login);
router.post('/createUser', createUserWithGoogleSignIn);
router.post('/changePassword',changePasswordReq);
router.get('/resetPassword/:token',resetPassword);

export default router;

