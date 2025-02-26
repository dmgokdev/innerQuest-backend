import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	REQUIRED_FIELDS,
	INVALID_USERANSWERS_ID,
	GET_USERANSWERS_QUERY_SCHEMA_CONFIG,
	INTEGER_ERROR,
	USER_NOT_FOUND,
	INVALID_QUESTION_ID,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const getUserAnswersSchema = yup.object({
	query: createQueryParamsSchema(GET_USERANSWERS_QUERY_SCHEMA_CONFIG),
});

export const addUserAnswersSchema = yup.object({
	body: yup.object({
		answers: yup
			.array()
			.of(
				yup.object({
					answer: yup.string().required(REQUIRED_FIELDS),
					question_id: yup
						.number()
						.positive()
						.integer(INTEGER_ERROR)
						.required(REQUIRED_FIELDS)
						.test({
							name: 'valid-question',
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
			)
			.required()
			.min(1, 'At least one answer is required'),
	}),
});

export const updateUserAnswersSchema = yup.object({
	body: yup.object({
		user_id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.notRequired()
			.test({
				name: 'valid-form',
				message: USER_NOT_FOUND,
				async test(value) {
					if (!value) return Boolean(1);
					const record = await prisma.users.findFirst({
						where: {
							deleted: false,
							id: value,
						},
					});
					return !record || !record.id ? Boolean(1) : Boolean(0);
				},
			}),
		answer: yup.string().notRequired(),
		question_id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.notRequired()
			.test({
				name: 'valid-form',
				message: INVALID_QUESTION_ID,
				async test(value) {
					if (!value) return Boolean(1);
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
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_USERANSWERS_ID,
				async test(value) {
					const record = await prisma.user_answers.findUnique({
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

export const UserAnswersIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_USERANSWERS_ID,
				async test(value) {
					const record = await prisma.user_answers.findUnique({
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

export const deleteUserAnswersSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS),
	}),
});
