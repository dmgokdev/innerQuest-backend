import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';

import { USERANSWERS_NOT_FOUND } from '../constants';
import { AppError } from '../errors';

const prisma = new PrismaClient();

export class UserAnswersService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	/* eslint-disable-next-line class-methods-use-this */
	async getAllUserAnswers() {
		const { query } = this.req;

		/* eslint-disable-next-line prefer-const */
		let { page, limit, sort, user_id, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const options = {
			where: {
				deleted: false,
				user_id: parseInt(user_id, 10) || undefined,
			},
		};

		if (search) {
			options.where.AND = Object.keys(search).map(key => ({
				[key]: { contains: search[key] },
			}));
		}
		if (sort) {
			const [field, direction] = sort.split(':');
			options.orderBy = [
				{
					[field]: direction,
				},
			];
		}

		const totalCount = await prisma.user_answers.count(options);

		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;

		const allRecords = await prisma.user_answers.findMany(options);

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0)
			throw new AppError(
				USERANSWERS_NOT_FOUND,
				HttpStatus.NOT_FOUND,
				allRecords,
			);

		return {
			records: allRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async getUserAnswers() {
		const { id } = this.req.params;
		const record = await prisma.user_answers.findUnique({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
		});
		if (!record || !record.id)
			throw new AppError(USERANSWERS_NOT_FOUND, HttpStatus.NOT_FOUND);
		return record;
	}

	async createUserAnswers() {
		const { answers } = this.req.body;
		const { user } = this.req;

		const results = await prisma.$transaction(async prisma => {
			const log = await prisma.user_answers_logs.create({
				data: {
					user_id: user.id,
				},
			});

			const newAnswers = answers.map(answerData => ({
				user_id: user.id,
				question_id: answerData.question_id,
				answer: answerData.answer,
				log_id: log.id,
			}));

			await prisma.user_answers.createMany({
				data: newAnswers,
			});

			const createdAnswers = await prisma.user_answers.findMany({
				where: {
					log_id: log.id,
				},
			});

			await prisma.users.update({
				where: {
					id: user.id,
				},
				data: {
					plan: 'Free',
					plan_id: 1,
				},
			});

			const users = await prisma.users.findFirst({
				where: {
					id: user.id,
				},
			});

			const hasAnswers = await prisma.user_answers.findFirst({
				where: {
					user_id: user.id,
					deleted: false,
				},
			});

			const hasLogs = await prisma.user_answers_logs.findFirst({
				where: {
					user_id: user.id,
					deleted: false,
				},
			});

			users.hasAnswers = !!(hasAnswers && hasLogs);

			return {
				createdAnswers,
				users,
			};
		});

		return results;
	}

	async updateUserAnswers() {
		const { id } = this.req.params;
		const { body } = this.req;

		const updateRecord = await prisma.user_answers.update({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
			data: body,
		});

		return updateRecord;
	}

	async deleteUserAnswers() {
		const { id } = this.req.params;

		await prisma.user_answers.update({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
			data: {
				deleted: true,
			},
		});

		return null;
	}

	async deleteManyUserAnswers() {
		const { ids } = this.req.body;

		await prisma.user_answers.updateMany({
			where: {
				id: {
					in: ids,
				},
			},
			data: {
				deleted: true,
			},
		});

		return null;
	}
}
