import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	GET_PLAN_SUCCESS,
	PLAN_CREATED_SUCCESS,
	PLAN_UPDATED_SUCCESS,
	PLAN_DELETED_SUCCESS,
} from '../constants';
import { PlanService } from '../services';
import { successResponse } from '../utils';

export const getAllPlans = asyncHandler(async (req, res) => {
	const planService = new PlanService(req);
	const data = await planService.getAllPlans();

	return successResponse(res, HttpStatus.OK, GET_PLAN_SUCCESS, data);
});

export const getPlan = asyncHandler(async (req, res) => {
	const planService = new PlanService(req);
	const data = await planService.getPlan();

	return successResponse(res, HttpStatus.OK, GET_PLAN_SUCCESS, data);
});

export const createPlan = asyncHandler(async (req, res) => {
	const planService = new PlanService(req);
	const data = await planService.createPlan();

	return successResponse(res, HttpStatus.OK, PLAN_CREATED_SUCCESS, data);
});

export const updatePlan = asyncHandler(async (req, res) => {
	const planService = new PlanService(req);
	const data = await planService.updatePlan();

	return successResponse(res, HttpStatus.OK, PLAN_UPDATED_SUCCESS, data);
});

export const deletePlan = asyncHandler(async (req, res) => {
	const planService = new PlanService(req);
	const data = await planService.deletePlan();

	return successResponse(res, HttpStatus.OK, PLAN_DELETED_SUCCESS, data);
});

export const deleteManyPlans = asyncHandler(async (req, res) => {
	const planService = new PlanService(req);
	const data = await planService.deleteManyPlans();

	return successResponse(res, HttpStatus.OK, PLAN_DELETED_SUCCESS, data);
});
