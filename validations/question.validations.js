import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	REQUIRED_FIELDS,
	INVALID_QUESTION_ID,
	GET_QUESTION_QUERY_SCHEMA_CONFIG,
	INTEGER_ERROR,
	QUESTION_ALREADY_EXISTS,
	INVALID_STEP_ID,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const getQuestionSchema = yup.object({
	query: createQueryParamsSchema(GET_QUESTION_QUERY_SCHEMA_CONFIG),
});

export const addQuestionSchema = yup.object({
	body: yup.object({
		title: yup
			.string()
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: QUESTION_ALREADY_EXISTS,
				async test(value) {
					const record = await prisma.questions.findFirst({
						where: {
							deleted: false,
							title: value,
						},
					});
					return !record || !record.id ? Boolean(1) : Boolean(0);
				},
			}),
		description: yup.string().notRequired(),
		sort: yup.number().notRequired(),
		prompt: yup.string().notRequired(),
		step_id: yup
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

export const updateQuestionSchema = yup.object({
	body: yup.object({
		title: yup
			.string()
			.notRequired()
			.test({
				name: 'valid-form',
				message: QUESTION_ALREADY_EXISTS,
				async test(value) {
					if (!value) return Boolean(1);
					const record = await prisma.questions.findFirst({
						where: {
							deleted: false,
							title: value,
						},
					});
					return !record || !record.id ? Boolean(1) : Boolean(0);
				},
			}),
		description: yup.string().notRequired(),
		sort: yup.number().notRequired(),
		prompt: yup.string().notRequired(),
		step_id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.notRequired()
			.test({
				name: 'valid-form',
				message: INVALID_STEP_ID,
				async test(value) {
					if (!value) return Boolean(1);
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
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_QUESTION_ID,
				async test(value) {
					const record = await prisma.questions.findUnique({
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

export const QuestionIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_QUESTION_ID,
				async test(value) {
					const record = await prisma.questions.findUnique({
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

export const deleteQuestionsSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS),
	}),
});
