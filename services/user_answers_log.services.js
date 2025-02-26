import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';

import { USERANSWERSLOGS_NOT_FOUND } from '../constants';
import { AppError } from '../errors';

const prisma = new PrismaClient();

export class UserAnswersLogService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	/* eslint-disable-next-line class-methods-use-this */
	async getAllUserAnswersLogs() {
		const { query } = this.req;
		const { user } = this.req;

		/* eslint-disable-next-line prefer-const */
		let { page, limit, sort, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const options = {
			where: {
				deleted: false,
			},
			include: {
				bussiness_idea: true,
			},
		};

		if (search) {
			options.where.AND = Object.keys(search).map(key => {
				const value = search[key];
				if (key === 'user_id' || !isNaN(value)) {
					return {
						[key]: parseInt(value, 10),
					};
				}
				return {
					[key]: { contains: value },
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

		const totalCount = await prisma.user_answers_logs.count({
			where: options.where,
		});

		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;

		const allRecords = await prisma.user_answers_logs.findMany(options);

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0) {
			throw new AppError(
				USERANSWERSLOGS_NOT_FOUND,
				HttpStatus.NOT_FOUND,
				allRecords,
			);
		}

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
			records: allRecords,
			totalRecords: totalCount,
			totalPages,
			query,
			users,
		};
	}

	async getUserAnswersLogs() {
		const { id } = this.req.params;
		const record = await prisma.user_answers_logs.findUnique({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
		});
		if (!record || !record.id)
			throw new AppError(USERANSWERSLOGS_NOT_FOUND, HttpStatus.NOT_FOUND);
		return record;
	}
}
