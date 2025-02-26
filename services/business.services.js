import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';

import { BUSINESS_NOT_FOUND } from '../constants';
import { AppError } from '../errors';

const prisma = new PrismaClient();

export class BusinessService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	/* eslint-disable-next-line class-methods-use-this */
	async getAllBusiness() {
		const { query } = this.req;

		/* eslint-disable-next-line prefer-const */
		let { page, limit, sort, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const options = {
			where: {
				deleted: false,
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

		const totalCount = await prisma.bussiness_idea.count({
			where: options.where,
		});

		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;
		options.select = {
			id: true,
			pdf_path: true,
			deleted: true,
			created_at: true,
			updated_at: true,
			plan_id: true,
			users: {
				select: {
					name: true,
					email: true,
				}
			},
			plans: true,
		};

		const allRecords = await prisma.bussiness_idea.findMany(options);

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0)
			throw new AppError(BUSINESS_NOT_FOUND, HttpStatus.NOT_FOUND, allRecords);

		return {
			records: allRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async getBusiness() {
		const { id } = this.req.params;
		const record = await prisma.bussiness_idea.findUnique({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
			include: {
				users: {
					select: {
						name: true,
						email: true,
					}
				},
				plans: true,
			},
		});
		if (!record || !record.id)
			throw new AppError(BUSINESS_NOT_FOUND, HttpStatus.NOT_FOUND);
		return record;
	}

	async createBusiness() {
		const { body } = this.req;

		const business = await prisma.bussiness_idea.create({
			data: {
				...body,
			},
		});

		return business;
	}

	async updateBusiness() {
		const { id } = this.req.params;
		const { body } = this.req;

		const updateRecord = await prisma.bussiness_idea.update({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
			data: body,
		});

		return updateRecord;
	}

	async deleteBusiness() {
		const { id } = this.req.params;

		await prisma.bussiness_idea.update({
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

	async deleteManyBusinesss() {
		const { ids } = this.req.body;

		await prisma.bussiness_idea.updateMany({
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
