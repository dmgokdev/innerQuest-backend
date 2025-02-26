import { PrismaClient } from '@prisma/client';
import * as yup from 'yup';

import {
	INTEGER_ERROR,
	INVALID_PLAN_ID,
	REQUIRED_FIELDS,
	INVALID_PAYMENT_ID,
	GET_PAYMENT_QUERY_SCHEMA_CONFIG,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const getPaymentSchema = yup.object({
	query: createQueryParamsSchema(GET_PAYMENT_QUERY_SCHEMA_CONFIG),
});

export const paymentIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_PAYMENT_ID,
				async test(value) {
					const record = await prisma.payments.findUnique({
						where: {
							id: parseInt(value, 10),
							deleted: false,
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const createPaymentSchema = yup.object({
	body: yup.object({
		plan: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_PLAN_ID,
				async test(value) {
					const record = await prisma.plans.findUnique({
						where: {
							id: parseInt(value, 10),
							deleted: false,
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});
