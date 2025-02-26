import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';

import { QUESTION_NOT_FOUND } from '../constants';
import { AppError } from '../errors';

const prisma = new PrismaClient();

export class QuestionService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	/* eslint-disable-next-line class-methods-use-this */
	async getAllQuestions() {
		const { query } = this.req;

		/* eslint-disable-next-line prefer-const */
		let { page, limit, sort, user_id, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const options = {
			where: {
				deleted: false,
			},
		};

		if (search) {
			options.where.AND = Object.keys(search).map(key => {
				if (key === 'step_id') {
					return {
						step_id: parseInt(search[key], 10),
					};
				}
				return {
					[key]: { contains: search[key] },
				};
			});
		}
		if (sort) {
			const [field, direction] = sort.split(':');
			options.orderBy = [
				{
					[field]: direction,
				},
			];
		}

		const totalCount = await prisma.questions.count({
			where: options.where,
		});

		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;
		options.include = {
			user_answers: {
				where: {
					deleted: false,
					user_id: parseInt(user_id, 10) || undefined,
				},
				select: {
					id: true,
					answer: true,
					user_id: true,
				},
			},
			steps: {
				select: {
					id: true,
					name: true,
				},
			},
		};

		const allRecords = await prisma.questions.findMany(options);

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0)
			throw new AppError(QUESTION_NOT_FOUND, HttpStatus.NOT_FOUND, allRecords);

		return {
			records: allRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async getQuestion() {
		const { id } = this.req.params;
		const record = await prisma.questions.findUnique({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
		});
		if (!record || !record.id)
			throw new AppError(QUESTION_NOT_FOUND, HttpStatus.NOT_FOUND);
		return record;
	}

	async createQuestion() {
		const { body } = this.req;

		const question = await prisma.questions.create({
			data: {
				...body,
			},
		});

		return question;
	}

	async updateQuestion() {
		const { id } = this.req.params;
		const { body } = this.req;

		const updateRecord = await prisma.questions.update({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
			data: body,
		});

		return updateRecord;
	}

	async deleteQuestion() {
		const { id } = this.req.params;

		await prisma.questions.update({
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

	async deleteManyQuestions() {
		const { ids } = this.req.body;

		await prisma.questions.updateMany({
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
