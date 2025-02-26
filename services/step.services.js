import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';

import { STEP_NOT_FOUND } from '../constants';
import { AppError } from '../errors';

const prisma = new PrismaClient();

export class StepService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	/* eslint-disable-next-line class-methods-use-this */
	async getAllSteps() {
		const { query } = this.req;

		/* eslint-disable-next-line prefer-const */
		let { page, limit, sort, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const options = {
			where: {
				deleted: false,
			},
			include: {
				questions: {
					where: {
						deleted: false,
					},
					orderBy: {
						sort: 'asc',
					},
				},
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

		const totalCount = await prisma.steps.count({
			where: options.where,
		});

		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;

		const allRecords = await prisma.steps.findMany(options);

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0)
			throw new AppError(STEP_NOT_FOUND, HttpStatus.NOT_FOUND, allRecords);

		return {
			records: allRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async getStep() {
		const { id } = this.req.params;
		const record = await prisma.steps.findUnique({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
		});
		if (!record || !record.id)
			throw new AppError(STEP_NOT_FOUND, HttpStatus.NOT_FOUND);
		return record;
	}

	async createStep() {
		const { body } = this.req;

		const step = await prisma.steps.create({
			data: {
				...body,
			},
		});

		return step;
	}

	async updateStep() {
		const { id } = this.req.params;
		const { body } = this.req;

		const updateRecord = await prisma.steps.update({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
			data: body,
		});

		return updateRecord;
	}

	async deleteStep() {
		const { id } = this.req.params;

		await prisma.steps.update({
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

	async deleteManySteps() {
		const { ids } = this.req.body;

		await prisma.steps.updateMany({
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
