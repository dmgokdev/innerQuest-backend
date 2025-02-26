import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { BASE_URL } from '../config';

import puppeteer from 'puppeteer';
import bcrypt from 'bcrypt';
import HttpStatus from 'http-status-codes';
import axios from 'axios';

import {
	USER_NOT_FOUND,
	ACCOUNT_STATUS,
	SOMETHING_WENT_WRONG,
} from '../constants';
import { AppError } from '../errors';
import { generateRandomString, sendEmail } from '../utils';
import {
	OPENAI_API_KEY,
	OPENAI_URL,
	OPENAI_MODEL,
	OPENAI_TEMPRATURE,
	OPENAI_MAX_TOKEN,
} from '../config';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class UserService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	/* eslint-disable-next-line class-methods-use-this */
	async getAllUsers() {
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

		const totalCount = await prisma.users.count(options);

		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;
		options.select = {
			id: true,
			name: true,
			email: true,
			password: false,
			birth_date: true,
			gender: true,
			remember_token: false,
			status: true,
			deleted: true,
			created_at: true,
			updated_at: true,
			last_login: true,
			address: true,
			city: true,
			country: true,
			image: true,
			state: true,
			number: true,
			lat_long: true,
			postal_code: true,
			plan: true,
			bussiness_idea: {
				select: {
					id: true,
					pdf_path: true,
				},
			},
		};

		const allRecords = await prisma.users.findMany(options);

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0)
			throw new AppError(USER_NOT_FOUND, HttpStatus.NOT_FOUND);

		return {
			records: allRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async getUser() {
		const { id } = this.req.params;
		const record = await prisma.users.findUnique({
			where: {
				id: parseInt(id, 10),
				deleted: false,
			},
			include: {
				user_answers: {
					where: {
						deleted: false,
					},
					select: {
						id: true,
						answer: true,
						user_id: true,
						questions: {
							select: {
								id: true,
								title: true,
								steps: {
									select: {
										id: true,
										name: true,
									},
								},
							},
						},
					},
				},
				user_answers_logs: {
					include: {
						bussiness_idea: true,
					}
				}
			},
		});
		return this.publicProfile(record);
	}

	async createUser() {
		const { body, user } = this.req;
		let { password } = body;

		const birthDate = body.birth_date;

		if (!password) {
			password = generateRandomString(6, 20);
		}

		body.password = await bcrypt.hash(password, 12);
		if (birthDate) {
			body.birth_date = new Date(`${birthDate}T00:00:00.000Z`);
		}
		body.status = ACCOUNT_STATUS.ACTIVE;

		body.created_by = user.id;

		const newUser = await prisma.users.create({ data: body });

		return this.publicProfile(newUser);
	}

	async updateUser() {
		const { id } = this.req.params;
		const { password, ...updateData } = this.req.body;

		updateData.role_id = 2;

		if (password) {
			updateData.password = await bcrypt.hash(password, 12);
		}

		const updateRecord = await prisma.users.update({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
			data: updateData,
		});

		return this.publicProfile(updateRecord);
	}

	async updateManyUser() {
		const { ids, status } = this.req.body;

		const updateRecord = await prisma.users.updateMany({
			where: {
				id: {
					in: ids,
				},
			},
			data: {
				status,
			},
		});

		return updateRecord;
	}

	async deleteUser() {
		const { id } = this.req.params;

		await prisma.users.update({
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

	async deleteManyUser() {
		const { ids } = this.req.body;

		await prisma.users.updateMany({
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

	async generatePDF(businessIdea) {
		try {
			const browser = await puppeteer.launch({ headless: 'new' });
			const page = await browser.newPage();

			await page.setContent(`
				<style>
					body {
						font-family: Arial, sans-serif;
						padding: 40px;
						line-height: 1.6;
					}
					h1 {
						color: #2c3e50;
						border-bottom: 2px solid #3498db;
						padding-bottom: 10px;
					}
					h4 {
						color: #2980b9;
						margin-bottom: 5px;
					}
					ul, ol {
						padding-left: 20px;
					}
					li {
						margin-bottom: 15px;
					}
				</style>
				<div>
					<div style="width: 100%; display: block; max-width: 655px; margin: 0 auto; text-align: center; padding: 0px 0px 18px 0px; background: black; background-repeat: no-repeat; background-size: cover">
						<div class="blue-bg-section" style="border-radius: 0px 0px 25px 25px; padding: 30px 0px 0px 0px; margin-bottom: 30px">
							<div style="border-bottom: 1px solid rgba(255, 255, 255, 0.2)">
								<div class="logo-section" style="padding: 10px 20px 20px 20px">
									<img src="${BASE_URL}public/images/group4.png" style="display: inline-block; max-width: 250px" />
								</div>
							</div>
							<h2 style="font-size: 30px; font-weight: 900; color: #ffffff; max-width: 550px; margin: 23px auto 23px auto; padding: 0px 20px 20px; font-family: 'Lato', sans-serif">Personalized Business Plan Generated by InnerQuest</h2>
						</div>
						<div>
							<div>
								<div class="business-info" style="margin: 20px 30px 20px 30px; background-color: rgba(255, 255, 255, 0.9); border-radius: 25px; text-align: left; padding: 28px 20px 28px 20px; font-size: 16px; border: 1px solid #c3dcec"> ${businessIdea.response} </div>
							</div>
						</div>
					</div>
				</div>
			`);

			// Generate PDF
			const pdfBuffer = await page.pdf({
				format: 'A4',
				margin: {
					top: '10px',
					right: '5px',
					bottom: '10px',
					left: '5px',
				},
			});

			await browser.close();

			const fileName = `business_idea_${businessIdea.id}.pdf`;
			const filePath = path.join(__dirname, '../temp_uploads/pdfs', fileName);

			// Ensure directory exists
			const dir = path.dirname(filePath);
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true });
			}

			fs.writeFileSync(filePath, pdfBuffer);

			await prisma.bussiness_idea.update({
				where: {
					id: businessIdea.id,
				},
				data: {
					pdf_path: `pdfs/${fileName}`,
				},
			});

			return `pdfs/${fileName}`;
		} catch (error) {
			console.error('PDF Generation Error:', error);
			throw new AppError(
				'Failed to generate PDF',
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async generateBussinessIdea() {
		const { user } = this.req;

		if (user.plan_id === 1)
			throw new AppError(
				'You need to upgrade to a paid plan to generate a business idea',
				HttpStatus.BAD_REQUEST,
			);

		const record = await prisma.user_answers_logs.findMany({
			where: {
				user_id: user.id,
			},
			orderBy: {
				created_at: 'desc',
			},
			take: 1,
		});

		if (!record || !Array.isArray(record) || record.length === 0)
			throw new AppError('Answer not found', HttpStatus.NOT_FOUND);

		const latestAnswersLog = record[0];

		const businessIdea = await prisma.bussiness_idea.findFirst({
			where: {
				user: user.id,
				deleted: false,
				log_id: latestAnswersLog.id,
				plan_id: user.plan_id,
			},
		});

		if (businessIdea) {
			if (!businessIdea?.pdf_path) {
				const pdf = await this.generatePDF(businessIdea);
				businessIdea.pdf_path = pdf;
			}
			this.sendBusinessEmail(businessIdea);
			return { record: businessIdea };
		}

		const userAnswers = await prisma.user_answers.findMany({
			where: {
				user_id: user.id,
				deleted: false,
				log_id: latestAnswersLog.id,
			},
			include: {
				questions: {
					select: {
						prompt: true,
						sort: true,
					},
				},
			},
			orderBy: {
				questions: {
					sort: 'asc',
				},
			},
		});

		if (!userAnswers || !Array.isArray(userAnswers) || userAnswers.length === 0)
			throw new AppError('User Answers are not found', HttpStatus.NOT_FOUND);

		const promptContent = userAnswers
			.map((ua, index) => `${index + 1}. ${ua.questions.prompt}: ${ua.answer}`)
			.join('\\n');

		let finalPrompt;
		let systemContent;

		if (user.plan_id === 2) {
			systemContent =
				'You are a creative assistant that generates personalized mission statement based on user inputs.';
			finalPrompt = `User's Answers: 
				${promptContent}

				Generate a business idea based on the provided answers and format it in HTML as follows:

				<div>
					<ul>
						<li>
							<h4>Purpose:</h4>
							<p>[Insert One-liner Purpose]</p>
						</li>
						<li>
							<h4>Target Audience:</h4>
							<p>[Insert Target Audience]</p>
						</li>
						<li>
							<h4>Impact & Outcomes:</h4>
							<p>[Insert Impact and Outcomes]</p>
						</li>
					</ul>
				</div>
			`;
		} else if (user.plan_id === 3) {
			systemContent =
				'You are a creative assistant that generates personalized business ideas based on user inputs.';
			finalPrompt = `User's Answers: 
				${promptContent}
						
				Generate a business idea based on the provided answers and format it in HTML as follows:
	
				<div>
					<div>
						<h1>Executive Summary</h1>
						<p>[Insert Executive Summary]</p>
					</div>
					<ul>
						<li>
							<h4>Purpose:</h4>
							<p>[Insert One-liner Purpose]</p>
						</li>
						<li>
							<h4>Goals:</h4>
							<p>[Insert Goals]</p>
						</li>
						<li>
							<h4>Target Audience:</h4>
							<p>[Insert Target Audience]</p>
						</li>
					</ul>
	
					<div>
						<h1>Mission Statement</h1>
						<p>[Insert Mission Statement]</p>
					</div>
					<div>
						<h1>Detailed Objectives</h1>
					</div>
					<ol>
						<li>
							<h4>[Objective 1 title]</h4>
							<p>[Objective 1 description]</p>
						</li>
						<li>
							<h4>[Objective 2 title]</h4>
							<p>[Objective 2 description]</p>
						</li>
						<li>
							<h4>[Objective 3 title]</h4>
							<p>[Objective 3 description]</p>
						</li>
						<li>
							<h4>[Objective 4 title]</h4>
							<p>[Objective 4 description]</p>
						</li>
					</ol>
					<div>
						<h1>Market Analysis</h1>
						<p>[Insert Market Analysis]</p>
					</div>
					<ul>
						<li>
							<h4>Target Audience:</h4>
							<p>[Insert Target Audience]</p>
						</li>
						<li>
							<h4>Market Trends:</h4>
							<p>[Insert Market Trends]</p>
						</li>
						<li>
							<h4>Competitor Insights:</h4>
							<p>[Insert Competitor Insights]</p>
						</li>
					</ul>
					<div>
						<h1>Implementation Plan</h1>
					</div>
					<ol>
						<li>
							<h4>[Step 1 title with duration]:</h4>
							<p>[Step 1 description]</p>
						</li>
						<li>
							<h4>[Step 2 title with duration]:</h4>
							<p>[Step 2 description]</p>
						</li>
						<li>
							<h4>[Step 3 title with duration]:</h4>
							<p>[Step 3 description]</p>
						</li>
					</ol>
	
					<div>
						<h1>Conclusion</h1>
						<p>[Insert Conclusion]</p>
					</div>
				</div>
			`;
		} else {
			throw new AppError('No Plan Found', HttpStatus.NOT_FOUND);
		}

		const response = await axios.post(
			`${OPENAI_URL}/completions`,
			{
				model: OPENAI_MODEL,
				messages: [
					{
						role: 'system',
						content: systemContent,
					},
					{
						role: 'user',
						content: finalPrompt,
					},
				],
				temperature: Number(OPENAI_TEMPRATURE),
				max_tokens: Number(OPENAI_MAX_TOKEN),
				top_p: 1,
				frequency_penalty: 0,
				presence_penalty: 0,
			},
			{
				headers: {
					Authorization: `Bearer ${OPENAI_API_KEY}`,
					'Content-Type': 'application/json',
				},
			},
		);

		if (!response?.data?.choices?.[0]?.message?.content) {
			throw new AppError(SOMETHING_WENT_WRONG, HttpStatus.NOT_FOUND);
		}

		const businessInfo = response.data.choices[0].message.content;

		const cleanedBusinessInfo = businessInfo
			.replace(/```html|```|\n/g, '')
			.trim();

		const userAnswerWithLogId = userAnswers.find(answer => answer.log_id);
		const newBusinessIdea = await prisma.bussiness_idea.create({
			data: {
				response: cleanedBusinessInfo,
				user: user.id,
				plan_id: user.plan_id,
				log_id: userAnswerWithLogId.log_id,
			},
		});

		const pdf = await this.generatePDF(newBusinessIdea);
		newBusinessIdea.pdf_path = pdf;
		this.sendBusinessEmail(newBusinessIdea);

		return { record: newBusinessIdea };
	}

	async sendBusinessEmail(BusinessIdea) {
		const { user } = this.req;

		if (user.email.includes('@temp.com')) {
			return;
		}

		const htmlContent = fs.readFileSync(
			path.join(__dirname, '../temp_uploads/templates/business.html'),
			'utf8',
		);
		let emailTemplate = htmlContent
        .replaceAll('{businessInfo}', BusinessIdea.response)
        .replaceAll('{pdf_path}', `${BASE_URL}public/${BusinessIdea.pdf_path}`)
        .replaceAll('{BASE_URL}', `${BASE_URL}`);

		sendEmail({
			to: user.email,
			subject: 'Your Personalized Business Idea',
			html: emailTemplate,
		});
	}

	async dashboard() {
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const getCount = async (model, conditions) =>
			prisma[model].count({ where: conditions });
		const getAggregateSum = async (model, conditions) =>
			prisma[model].aggregate({
				where: conditions,
				_sum: { amount: true },
			});

		const [
			totalUsers,
			totalEarnings,
			newUsers,
			recentEarnings,
			earningsByYearAndMonth,
		] = await Promise.all([
			getCount('users', { deleted: false, status: 'ACTIVE' }),
			getAggregateSum('payments', { deleted: false, status: 'COMPLETED' }),
			getCount('users', {
				deleted: false,
				status: 'ACTIVE',
				created_at: { gte: thirtyDaysAgo },
			}),
			getAggregateSum('payments', {
				deleted: false,
				status: 'COMPLETED',
				created_at: { gte: thirtyDaysAgo },
			}),
			prisma.payments.groupBy({
				by: ['created_at'],
				where: { deleted: false, status: 'COMPLETED' },
				_sum: { amount: true },
			}),
		]);

		const monthlyEarnings = {};
		const currentDate = new Date();

		for (let i = 11; i >= 0; i--) {
			const month = new Date(currentDate);
			month.setMonth(currentDate.getMonth() - i);
			const key = `${month.getFullYear()}-${month.getMonth()}`;
			monthlyEarnings[key] = 0;
		}

		earningsByYearAndMonth.forEach(earning => {
			const date = new Date(earning.created_at);
			const key = `${date.getFullYear()}-${date.getMonth()}`;
			if (key in monthlyEarnings) {
				monthlyEarnings[key] += earning._sum.amount || 0;
			}
		});

		const orderedData = Object.entries(monthlyEarnings).sort((a, b) => {
			const [yearA, monthA] = a[0].split('-').map(Number);
			const [yearB, monthB] = b[0].split('-').map(Number);
			return yearA !== yearB ? yearA - yearB : monthA - monthB;
		});

		const monthNames = orderedData.map(([key]) => {
			const [year, month] = key.split('-').map(Number);
			return `${new Date(year, month).toLocaleString('default', { month: 'short' })} ${year.toString().slice(-2)}`;
		});

		const earnings = orderedData.map(([_, amount]) => amount);
		const steps = await prisma.steps.count({ where: { deleted: false } });
		const questions = await prisma.questions.count({ where: { deleted: false } });

		return {
			totalUsers,
			totalEarnings: `$${(totalEarnings._sum.amount || 0).toFixed(2)}`,
			newUsers,
			recentEarnings: `$${(recentEarnings._sum.amount || 0).toFixed(2)}`,
			earnings: [
				{
					categories: monthNames,
					earnings: earnings.map(amount => `$${amount.toFixed(2)}`),
				},
			],
			lastUpdated: new Date().toISOString(),
			totalSteps: steps,
			totaluestions: questions,
		};
	}

	/* eslint-disable-next-line class-methods-use-this */
	publicProfile(user) {
		const record = { ...user };
		if (!record || !record.id)
			throw new AppError(USER_NOT_FOUND, HttpStatus.NOT_FOUND);

		if (record.password) delete record.password;
		if (record.remember_token) delete record.remember_token;

		return record;
	}
}
