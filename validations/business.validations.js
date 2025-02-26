import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	REQUIRED_FIELDS,
	INVALID_BUSINESS_ID,
	GET_BUSINESS_QUERY_SCHEMA_CONFIG,
	INTEGER_ERROR,
	BUSINESS_ALREADY_EXISTS,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const getBusinessSchema = yup.object({
	query: createQueryParamsSchema(GET_BUSINESS_QUERY_SCHEMA_CONFIG),
});

export const addBusinessSchema = yup.object({
	body: yup.object({
		name: yup
			.string()
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: BUSINESS_ALREADY_EXISTS,
				async test(value) {
					const record = await prisma.bussiness_idea.findFirst({
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

export const updateBusinessSchema = yup.object({
	body: yup.object({
		name: yup
			.string()
			.notRequired()
			.test({
				name: 'valid-form',
				message: BUSINESS_ALREADY_EXISTS,
				async test(value) {
					if (!value) return Boolean(1);
					const record = await prisma.bussiness_idea.findFirst({
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
				message: INVALID_BUSINESS_ID,
				async test(value) {
					const record = await prisma.bussiness_idea.findUnique({
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

export const BusinessIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_BUSINESS_ID,
				async test(value) {
					const record = await prisma.bussiness_idea.findUnique({
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

export const deleteBusinesssSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS),
	}),
});
