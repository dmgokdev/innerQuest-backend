import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	GET_QUESTION_SUCCESS,
	QUESTION_CREATED_SUCCESS,
	QUESTION_UPDATED_SUCCESS,
	QUESTION_DELETED_SUCCESS,
} from '../constants';
import { QuestionService } from '../services';
import { successResponse } from '../utils';

export const getAllQuestions = asyncHandler(async (req, res) => {
	const questionService = new QuestionService(req);
	const data = await questionService.getAllQuestions();

	return successResponse(res, HttpStatus.OK, GET_QUESTION_SUCCESS, data);
});

export const getQuestion = asyncHandler(async (req, res) => {
	const questionService = new QuestionService(req);
	const data = await questionService.getQuestion();

	return successResponse(res, HttpStatus.OK, GET_QUESTION_SUCCESS, data);
});

export const createQuestion = asyncHandler(async (req, res) => {
	const questionService = new QuestionService(req);
	const data = await questionService.createQuestion();

	return successResponse(res, HttpStatus.OK, QUESTION_CREATED_SUCCESS, data);
});

export const updateQuestion = asyncHandler(async (req, res) => {
	const questionService = new QuestionService(req);
	const data = await questionService.updateQuestion();

	return successResponse(res, HttpStatus.OK, QUESTION_UPDATED_SUCCESS, data);
});

export const deleteQuestion = asyncHandler(async (req, res) => {
	const questionService = new QuestionService(req);
	const data = await questionService.deleteQuestion();

	return successResponse(res, HttpStatus.OK, QUESTION_DELETED_SUCCESS, data);
});

export const deleteManyQuestions = asyncHandler(async (req, res) => {
	const questionService = new QuestionService(req);
	const data = await questionService.deleteManyQuestions();

	return successResponse(res, HttpStatus.OK, QUESTION_DELETED_SUCCESS, data);
});
