import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	PAYMENT_INTENT_CREATED,
	PAYMENT_CONFIRMED,
	GET_PAYMENT_SUCCESS,
} from '../constants';
import { PaymentService } from '../services';
import { successResponse } from '../utils';

export const createPaymentIntent = asyncHandler(async (req, res) => {
	const paymentService = new PaymentService(req);
	const data = await paymentService.createIntent();

	return successResponse(res, HttpStatus.OK, PAYMENT_INTENT_CREATED, data);
});

export const confirmPayment = asyncHandler(async (req, res) => {
	const paymentService = new PaymentService(req);
	const data = await paymentService.confirmPayment();

	return successResponse(res, HttpStatus.OK, PAYMENT_CONFIRMED, data);
});

export const getAllPayments = asyncHandler(async (req, res) => {
	const paymentService = new PaymentService(req);
	const data = await paymentService.getPayments();

	return successResponse(res, HttpStatus.OK, GET_PAYMENT_SUCCESS, data);
});

export const getPayment = asyncHandler(async (req, res) => {
	const paymentService = new PaymentService(req);
	const data = await paymentService.getPayment();

	return successResponse(res, HttpStatus.OK, GET_PAYMENT_SUCCESS, data);
});
