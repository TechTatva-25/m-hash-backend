import { query } from "express-validator";

export const getCollegeValidator = [query("college_id").isString().isMongoId()];
