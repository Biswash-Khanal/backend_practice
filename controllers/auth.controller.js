import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";

export const signUp = async (req, res, next) => {
	//signup logic
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const { name, email, password } = req.body;

		//check if a user already exists

		const existingUser = await User.findOne({ email });

		if (existingUser) {
			const error = new Error("user already exists");
			error.statusCode = 400;
			throw error;
		}

		//hash password

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newUsers = await User.create(
			[{ name, email, password: hashedPassword }],
			{ session }
		);

		const token = jwt.sign({ userId: newUsers[0]._id }, JWT_SECRET, {
			expiresIn: JWT_EXPIRES_IN,
		});

		await session.commitTransaction();
		session.endSession();

		res.status(201).json({
			success: true,
			message: "user created successfully",
			data: {
				token,
				user: newUsers[0],
			},
		});
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		next(error);
	}
};

export const signIn = async (req, res, next) => {
	//signin logic
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		//get email and password from the frontend or the request
		const { email, password } = req.body;

		const existingUser = await User.findOne({ email });

		if (!existingUser) {
			const error = new Error("Email or password is incorrect please check");
			error.statusCode = 400;
			throw error;
		}

		const passwordCorrect = await bcrypt.compare(
			password,
			existingUser.password
		);

		if (!passwordCorrect) {
			const error = new Error("Email or password is incorrect please check");
			error.statusCode = 401;
			throw error;
		}

        const token = jwt.sign({ userId: existingUser._id }, JWT_SECRET, {
			expiresIn: JWT_EXPIRES_IN,
		});

        await session.commitTransaction();
		session.endSession();

		res.status(200).json({
			success: true,
			message: "user signed in successfully",
            data:{
                token,
                existingUser
            }

		});


		//see if an account with this email is registered if no, say user email or password is incoreect redirect to register page, if does exists then-->
		//compare the entered password with the hashed password saved in database somehow, if that doesnt match, give error with message email or password not correct if does match,
		//cookies and token stuff
		//sign them in

		//check if a user already exists

		//hash password
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		next(error);
	}
};

export const signOut = async (req, res, next) => {
	//signup logic
};
