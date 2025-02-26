import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	GET_BUSINESS_SUCCESS,
	BUSINESS_CREATED_SUCCESS,
	BUSINESS_UPDATED_SUCCESS,
	BUSINESS_DELETED_SUCCESS,
} from '../constants';
import { BusinessService } from '../services';
import { successResponse } from '../utils';

export const getAllBusiness = asyncHandler(async (req, res) => {
	const businessService = new BusinessService(req);
	const data = await businessService.getAllBusiness();

	return successResponse(res, HttpStatus.OK, GET_BUSINESS_SUCCESS, data);
});

export const getBusiness = asyncHandler(async (req, res) => {
	const businessService = new BusinessService(req);
	const data = await businessService.getBusiness();

	return successResponse(res, HttpStatus.OK, GET_BUSINESS_SUCCESS, data);
});

export const createBusiness = asyncHandler(async (req, res) => {
	const businessService = new BusinessService(req);
	const data = await businessService.createBusiness();

	return successResponse(res, HttpStatus.OK, BUSINESS_CREATED_SUCCESS, data);
});

export const updateBusiness = asyncHandler(async (req, res) => {
	const businessService = new BusinessService(req);
	const data = await businessService.updateBusiness();

	return successResponse(res, HttpStatus.OK, BUSINESS_UPDATED_SUCCESS, data);
});

export const deleteBusiness = asyncHandler(async (req, res) => {
	const businessService = new BusinessService(req);
	const data = await businessService.deleteBusiness();

	return successResponse(res, HttpStatus.OK, BUSINESS_DELETED_SUCCESS, data);
});

export const deleteManyBusinesss = asyncHandler(async (req, res) => {
	const businessService = new BusinessService(req);
	const data = await businessService.deleteManyBusinesss();

	return successResponse(res, HttpStatus.OK, BUSINESS_DELETED_SUCCESS, data);
});
