import { body, query } from "express-validator";

export const registerValidator = [
	body("email", "Email is required").notEmpty(),
	body("email", "Email is invalid").isEmail().normalizeEmail(),
	body("username", "Name is required").isString().trim().notEmpty(),
	body("username", "Name must be at least 3 characters long").isLength({ min: 3 }),
	body("username", "Name must be at most 200 characters long").isLength({ max: 200 }),
	body("username", "Name must contain only alphanumeric characters, underscores, and spaces").matches(
		/^[a-zA-Z0-9_ ]+$/
	),
	body("password", "Password is required").isString().trim().notEmpty(),
	body("password", "Password must be at least 6 characters long").trim().isLength({ min: 8 }),
	body("password", "Password must contain at least one uppercase letter").matches(/[A-Z]/),
	body("password", "Password must contain at least one lowercase letter").matches(/[a-z]/),
	body("password", "Password must contain at least one number").matches(/[0-9]/),
	body("password", "Password must contain at least one special character").matches(/[^A-Za-z0-9]/),
	body("mobile_number", "Mobile number is required").isString().trim().notEmpty(),
	body(
		"mobile_number",
		'Mobile number must be in the format "+[country code] [number]" (e.g., "+91 8057456491")'
	).matches(/^\+(?:[0-9] ?){6,14}[0-9]$/),
	body("college", "College is required").isString().isMongoId(),
	body("collegeOther", "Other college name must be string").isString().optional(),
	body("gender", "Gender is required").isString().trim().notEmpty(),
	body("gender", "Gender must be either 'Male', 'Female', or 'Other'").isIn(["Male", "Female", "Other"]),
];

export const loginValidator = [
	body("email", "Email is required").notEmpty(),
	body("email", "Email is invalid").isEmail().normalizeEmail(),
	body("password", "Password is required").isString().trim().notEmpty(),
];

export const sendVerifyEmailValidator = [
	body("email", "Email is required").notEmpty(),
	body("email", "Email is invalid").isEmail().normalizeEmail(),
];

export const verifyEmailValidator = [
  body("email", "Email is required").isEmail().normalizeEmail(),
  body("otp", "OTP is required").isString().trim().notEmpty(),
];

export const forgotPasswordValidator = [
	body("email", "Email is required").notEmpty(),
	body("email", "Email is invalid").isEmail().normalizeEmail(),
];

export const resetPasswordValidator = [
	body("password", "Password is required").isString().trim().notEmpty(),
	body("password", "Password must be at least 6 characters long").trim().isLength({ min: 8 }),
	body("password", "Password must contain at least one uppercase letter").matches(/[A-Z]/),
	body("password", "Password must contain at least one lowercase letter").matches(/[a-z]/),
	body("password", "Password must contain at least one number").matches(/[0-9]/),
	body("password", "Password must contain at least one special character").matches(/[^A-Za-z0-9]/),
	body("token", "Token is required").isString().trim().notEmpty(),
];

export const listUsersValidator = [
	query("limit", "Limit must be a number").isInt({ min: 1, max: 3000 }).optional(),
	query("offset", "Offset must be a number").isInt({ min: 0 }).optional(),
	query("username", "Username must be a string").isString().optional(),
	query("email", "Email must be a string").isString().optional(),
];

export const makeJudgeValidator = [body("userId").isString().isMongoId()];