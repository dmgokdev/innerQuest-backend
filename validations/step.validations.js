import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	REQUIRED_FIELDS,
	INVALID_STEP_ID,
	GET_STEP_QUERY_SCHEMA_CONFIG,
	INTEGER_ERROR,
	STEP_ALREADY_EXISTS,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const getStepSchema = yup.object({
	query: createQueryParamsSchema(GET_STEP_QUERY_SCHEMA_CONFIG),
});

export const addStepSchema = yup.object({
	body: yup.object({
		name: yup
			.string()
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: STEP_ALREADY_EXISTS,
				async test(value) {
					const record = await prisma.steps.findFirst({
						where: {
							deleted: false,
							name: value,
						},
					});
					return !record || !record.id ? Boolean(1) : Boolean(0);
				},
			}),

		title: yup.string().required(REQUIRED_FIELDS),
		description: yup.string().required(REQUIRED_FIELDS),
	}),
});

export const updateStepSchema = yup.object({
	body: yup.object({
		name: yup
			.string()
			.notRequired()
			.test({
				name: 'valid-form',
				message: STEP_ALREADY_EXISTS,
				async test(value) {
					if (!value) return Boolean(1);
					const record = await prisma.steps.findFirst({
						where: {
							deleted: false,
							name: value,
						},
					});
					return !record || !record.id ? Boolean(1) : Boolean(0);
				},
			}),
		title: yup.string().notRequired(),
		description: yup.string().notRequired(),
	}),
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_STEP_ID,
				async test(value) {
					const record = await prisma.steps.findUnique({
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

export const StepIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_STEP_ID,
				async test(value) {
					const record = await prisma.steps.findUnique({
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

export const deleteStepsSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS),
	}),
});
