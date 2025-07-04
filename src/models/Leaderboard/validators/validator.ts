import { body } from "express-validator";

export const createBugValidator = [
  body("category").isString().notEmpty(),
  body("reported_by_team_id").isMongoId(),
  body("found_in_team_id").isMongoId(),
  body("status").isIn(["valid", "invalid", "pending"]),
  body("points_awarded").optional().isNumeric(),
];
