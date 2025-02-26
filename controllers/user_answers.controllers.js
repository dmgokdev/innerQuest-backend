import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	GET_USERANSWERS_SUCCESS,
	USERANSWERS_CREATED_SUCCESS,
	USERANSWERS_UPDATED_SUCCESS,
	USERANSWERS_DELETED_SUCCESS,
} from '../constants';
import { UserAnswersService } from '../services';
import { successResponse } from '../utils';

export const getAllUserAnswers = asyncHandler(async (req, res) => {
	const userAnswersService = new UserAnswersService(req);
	const data = await userAnswersService.getAllUserAnswers();

	return successResponse(res, HttpStatus.OK, GET_USERANSWERS_SUCCESS, data);
});

export const getUserAnswers = asyncHandler(async (req, res) => {
	const userAnswersService = new UserAnswersService(req);
	const data = await userAnswersService.getUserAnswers();

	return successResponse(res, HttpStatus.OK, GET_USERANSWERS_SUCCESS, data);
});

export const createUserAnswers = asyncHandler(async (req, res) => {
	const userAnswersService = new UserAnswersService(req);
	const data = await userAnswersService.createUserAnswers();

	return successResponse(res, HttpStatus.OK, USERANSWERS_CREATED_SUCCESS, data);
});

export const updateUserAnswers = asyncHandler(async (req, res) => {
	const userAnswersService = new UserAnswersService(req);
	const data = await userAnswersService.updateUserAnswers();

	return successResponse(res, HttpStatus.OK, USERANSWERS_UPDATED_SUCCESS, data);
});

export const deleteUserAnswers = asyncHandler(async (req, res) => {
	const userAnswersService = new UserAnswersService(req);
	const data = await userAnswersService.deleteUserAnswers();

	return successResponse(res, HttpStatus.OK, USERANSWERS_DELETED_SUCCESS, data);
});

export const deleteManyUserAnswers = asyncHandler(async (req, res) => {
	const userAnswersService = new UserAnswersService(req);
	const data = await userAnswersService.deleteManyUserAnswers();

	return successResponse(res, HttpStatus.OK, USERANSWERS_DELETED_SUCCESS, data);
});
