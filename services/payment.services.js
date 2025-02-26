import stripePackage from 'stripe';
import { PrismaClient } from '@prisma/client';
import { STRIPE_SECRET_KEY } from '../config';
import { PAYMENT_NOT_FOUND } from '../constants';
import { AppError } from '../errors';
import HttpStatus from 'http-status-codes';

const stripe = stripePackage(STRIPE_SECRET_KEY);
const Prisma = new PrismaClient();

export class PaymentService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}
	async createIntent() {
		const { user, body } = this.req;
		const { plan } = body;

		const planData = await Prisma.plans.findUnique({
			where: {
				id: plan,
				deleted: false,
			},
		});

		let customerId;
		let ephemeralKey = null;
		let paymentIntent = null;

		// const PLAN_PRICES = {
		// 	pro: 1.0,
		// 	business: 2.0,
		// };
		// if (!PLAN_PRICES[plan]) {
		// 	throw new Error('Invalid plan selected');
		// }

		if (user.plan_id === planData.id) {
			return { data: `You are already on ${plan} plan` };
		}

		const userStripeData = await Prisma.user_meta.findFirst({
			where: {
				user_id: user.id,
				key: 'stripe_id',
			},
		});

		if (userStripeData?.value) {
			customerId = userStripeData.value;
		} else {
			const customer = await stripe.customers.create({
				name: user.name,
				email: user.email,
			});
			customerId = customer.id;

			await Prisma.user_meta.create({
				data: {
					user_id: user.id,
					key: 'stripe_id',
					value: customerId,
				},
			});
		}

		ephemeralKey = await stripe.ephemeralKeys.create(
			{ customer: customerId },
			{ apiVersion: '2024-04-10' },
		);

		const totalAmount = Math.round(planData.price * 100);

		paymentIntent = await stripe.paymentIntents.create({
			amount: totalAmount,
			currency: 'usd',
			customer: customerId,
			automatic_payment_methods: {
				enabled: true,
			},
			metadata: {
				plan,
				userId: user.id,
			},
		});

		await Prisma.payments.create({
			data: {
				amount: planData.price || 0,
				description: paymentIntent?.id || null,
				response: paymentIntent ? JSON.stringify(paymentIntent) : null,
				created_by: user.id,
				plan_type: planData.name,
				plan_id: planData.id,
			},
		});

		return {
			paymentIntent: paymentIntent?.client_secret,
			ephemeralKey: ephemeralKey?.secret,
			customer: customerId,
			paymentIntentId: paymentIntent?.id,
			amount: totalAmount / 100,
			plan,
		};
	}

	async confirmPayment() {
		const { body, user } = this.req;
		const { paymentIntentId } = body;

		// const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
		// if (paymentIntent.status !== 'succeeded')
		// 	throw new AppError(
		// 		`Payment status: ${paymentIntent?.status}`,
		// 		HttpStatus.NOT_FOUND,
		// 	);

		const payment = await Prisma.payments.findFirst({
			where: {
				status: 'PENDING',
				created_by: user.id,
				description: paymentIntentId,
			},
			include: {
				plans: true,
			},
		});
		if (!payment) throw new AppError(PAYMENT_NOT_FOUND, HttpStatus.NOT_FOUND);

		const planData = await Prisma.plans.findUnique({
			where: {
				id: payment.plan_id,
				deleted: false,
			},
		});

		await Prisma.plan_logs.create({
			data: {
				plan_id: planData.id,
				user_id: user.id,
			},
		});

		const paymentdata = await Prisma.payments.update({
			where: {
				id: payment.id,
			},
			data: {
				status: 'COMPLETED',
			},
		});

		await Prisma.users.update({
			where: {
				id: parseInt(user.id, 10),
			},
			data: {
				plan_id: planData.id,
				plan: planData.name,
			},
		});

		return paymentdata;
	}

	async getPayments() {
		const { req } = this;
		const { query } = req;

		/* eslint-disable-next-line prefer-const */
		let { page, limit, sort, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const options = {
			where: {
				deleted: false,
				// created_by: user.id,
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

		const totalCount = await Prisma.payments.count(options);

		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;
		options.include = {
			users: {
				select: {
					id: true,
					name: true,
					email: true,
					plan: true,
				},
			},
		};

		const allRecords = await Prisma.payments.findMany(options);

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0)
			return errorResponse(res, HttpStatus.NOT_FOUND, PAYMENT_NOT_FOUND, {
				records: allRecords,
			});

		return {
			records: allRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async getPayment() {
		const { id } = this.req.params;

		const data = await Prisma.payments.findUnique({
			where: {
				deleted: false,
				id: Number(id),
			},
		});

		return data;
	}
}
