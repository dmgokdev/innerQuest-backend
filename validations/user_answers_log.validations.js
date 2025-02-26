import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	GET_USERANSWERSLOGS_QUERY_SCHEMA_CONFIG,
	INVALID_USERANSWERS_ID,
    INTEGER_ERROR,
    REQUIRED_FIELDS
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const getUserAnswersLogSchema = yup.object({
	query: createQueryParamsSchema(GET_USERANSWERSLOGS_QUERY_SCHEMA_CONFIG),
});

export const UserAnswersLogIdSchema = yup.object({
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
					const record = await prisma.user_answers_logs.findUnique({
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
