import { body } from "express-validator";

export const createBugValidator = [
  body("category").isString().notEmpty(),
  body("reported_by_team_id").isMongoId(),
  body("found_in_team_id").isMongoId(),
  body("status").isIn(["valid", "invalid", "pending"]),
  body("points_awarded").optional().isNumeric(),
];

export const updateBugValidator = [
  body("category").optional().isString().notEmpty(),
  body("reported_by_team_id").optional().isMongoId(),
  body("found_in_team_id").optional().isMongoId(),
  body("status").optional().isIn(["valid", "invalid", "pending"]),
  body("points_awarded").optional().isNumeric(),
];

export const createBugTypeValidator = [
  body("name").isString().notEmpty().withMessage("Bug type name is required"),
  body("default_points")
    .isNumeric()
    .withMessage("Default points must be a number"),
];

export const editTeamPointsValidator = [
  body("points").isNumeric().withMessage("Points must be a number"),
];

export const updateBugTypeValidator = [
  body("name")
    .optional()
    .isString()
    .notEmpty()
    .withMessage("Bug type name must be a non-empty string"),
  body("default_points")
    .optional()
    .isNumeric()
    .withMessage("Default points must be a number"),
];
