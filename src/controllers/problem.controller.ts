import type { NextFunction, Request, Response } from "express";

import Problem from "../models/Problem/problem";

export const getProblems = async (
	_req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const problems = await Problem.find();

		res.status(200).json(problems);
	} catch (error) {
		next(error);
	}
};

export const getProblem = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { problem_id } = req.query as Record<string, string>;
		const problem = await Problem.findById(problem_id);

		if (!problem) {
			res.status(404).json({ message: "Problem not found" });
			return;
		}

		res.status(200).json(problem);
	} catch (error) {
		next(error);
	}
};

export const createProblem = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { title, description, thumbnail, sdg_id, sdg_title } =
			req.body as Record<string, string>;

		const problem = new Problem({
			title,
			description,
			thumbnail,
			sdg_id,
			sdg_title,
		});
		await problem.save();

		res.status(201).json(problem);
	} catch (error) {
		next(error);
	}
};

export const updateProblem = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { problemId } = req.params as Record<string, string>;
		const { title, description, thumbnail, sdg_id, sdg_title } =
			req.body as Record<string, string>;

		const problem = await Problem.findByIdAndUpdate(
			problemId,
			{ title, description, thumbnail, sdg_id, sdg_title },
			{ new: true },
		);
		if (!problem) {
			res.status(404).json({ message: "Problem not found" });
			return;
		}

		res.status(200).json(problem);
	} catch (error) {
		next(error);
	}
};

export const deleteProblem = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { problemId } = req.params as Record<string, string>;

		const problem = await Problem.findByIdAndDelete(problemId);
		if (!problem) {
			res.status(404).json({ message: "Problem not found" });
			return;
		}

		res.status(200).json({ message: "Problem deleted successfully" });
	} catch (error) {
		next(error);
	}
};
