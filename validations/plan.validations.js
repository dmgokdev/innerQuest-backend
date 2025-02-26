import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	REQUIRED_FIELDS,
	INVALID_PLAN_ID,
	GET_PLAN_QUERY_SCHEMA_CONFIG,
	INTEGER_ERROR,
	PLAN_ALREADY_EXISTS,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const getPlanSchema = yup.object({
	query: createQueryParamsSchema(GET_PLAN_QUERY_SCHEMA_CONFIG),
});

export const addPlanSchema = yup.object({
	body: yup.object({
		name: yup
			.string()
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: PLAN_ALREADY_EXISTS,
				async test(value) {
					const record = await prisma.plans.findFirst({
						where: {
							deleted: false,
							name: value,
						},
					});
					return !record || !record.id ? Boolean(1) : Boolean(0);
				},
			}),
		description: yup.string().notRequired(),
		price: yup.number().positive().integer(INTEGER_ERROR).required(REQUIRED_FIELDS),
	}),
});

export const updatePlanSchema = yup.object({
	body: yup.object({
		name: yup.string().notRequired(),
		description: yup.string().notRequired(),
		price: yup.number().positive().integer(INTEGER_ERROR).notRequired(),
	}),
	params: yup.object({
		id: yup
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
							deleted: false,
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const PlanIdSchema = yup.object({
	params: yup.object({
		id: yup
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
							deleted: false,
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const deletePlansSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS),
	}),
});
