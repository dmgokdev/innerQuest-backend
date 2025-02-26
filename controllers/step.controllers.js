import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	GET_STEP_SUCCESS,
	STEP_CREATED_SUCCESS,
	STEP_UPDATED_SUCCESS,
	STEP_DELETED_SUCCESS,
} from '../constants';
import { StepService } from '../services';
import { successResponse } from '../utils';

export const getAllSteps = asyncHandler(async (req, res) => {
	const stepService = new StepService(req);
	const data = await stepService.getAllSteps();

	return successResponse(res, HttpStatus.OK, GET_STEP_SUCCESS, data);
});

export const getStep = asyncHandler(async (req, res) => {
	const stepService = new StepService(req);
	const data = await stepService.getStep();

	return successResponse(res, HttpStatus.OK, GET_STEP_SUCCESS, data);
});

export const createStep = asyncHandler(async (req, res) => {
	const stepService = new StepService(req);
	const data = await stepService.createStep();

	return successResponse(res, HttpStatus.OK, STEP_CREATED_SUCCESS, data);
});

export const updateStep = asyncHandler(async (req, res) => {
	const stepService = new StepService(req);
	const data = await stepService.updateStep();

	return successResponse(res, HttpStatus.OK, STEP_UPDATED_SUCCESS, data);
});

export const deleteStep = asyncHandler(async (req, res) => {
	const stepService = new StepService(req);
	const data = await stepService.deleteStep();

	return successResponse(res, HttpStatus.OK, STEP_DELETED_SUCCESS, data);
});

export const deleteManySteps = asyncHandler(async (req, res) => {
	const stepService = new StepService(req);
	const data = await stepService.deleteManySteps();

	return successResponse(res, HttpStatus.OK, STEP_DELETED_SUCCESS, data);
});
