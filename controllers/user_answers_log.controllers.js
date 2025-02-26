import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import { GET_USERANSWERSLOGS_SUCCESS } from '../constants';
import { UserAnswersLogService } from '../services';
import { successResponse } from '../utils';

export const getAllUserAnswersLogs = asyncHandler(async (req, res) => {
	const userAnswersService = new UserAnswersLogService(req);
	const data = await userAnswersService.getAllUserAnswersLogs();

	return successResponse(res, HttpStatus.OK, GET_USERANSWERSLOGS_SUCCESS, data);
});

export const getUserAnswersLogs = asyncHandler(async (req, res) => {
	const userAnswersService = new UserAnswersLogService(req);
	const data = await userAnswersService.getUserAnswersLogs();

	return successResponse(res, HttpStatus.OK, GET_USERANSWERSLOGS_SUCCESS, data);
});
