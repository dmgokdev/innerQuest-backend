import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import HttpStatus from 'http-status-codes';

import {
	INVALID_CREDENTIALS,
	USER_NOT_FOUND,
	ACCOUNT_STATUS,
	NOT_ALLOWED_TO_LOGIN,
} from '../constants';
import { AppError } from '../errors';
import { createAccessToken, createOtpToken, sendEmail } from '../utils';

const prisma = new PrismaClient();

export class AuthService {
	constructor(req) {
		this.req = req;
	}

	async login() {
		const { email, password, role } = this.req.body;

		const user = await prisma.users.findFirst({
			where: {
				deleted: false,
				email,
				status: ACCOUNT_STATUS.ACTIVE,
			},
		});

		if (!user || !user.id)
			throw new AppError(USER_NOT_FOUND, HttpStatus.NOT_FOUND);

		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid)
			throw new AppError(INVALID_CREDENTIALS, HttpStatus.BAD_REQUEST);

		if (role && role !== user.role_id)
			throw new AppError(NOT_ALLOWED_TO_LOGIN, HttpStatus.BAD_REQUEST);

		await prisma.auth_log.create({
			data: {
				user_id: user.id,
				type: 'login',
			},
		});

		const mailOptions = {
			to: user.email,
			subject: 'Login',
			text: 'You have successfully logged in to our platform',
			html: '<p>You have been Login in InnerQuest platform</p>',
		};

		sendEmail(mailOptions);

		const response = this.publicProfile(user);
		
		const hasAnswers = await prisma.user_answers.findFirst({
			where: {
				user_id: user.id,
				deleted: false
			}
		});

		const hasLogs = await prisma.user_answers_logs.findFirst({
			where: {
				user_id: user.id,
				deleted: false
			}
		});

		response.hasAnswers = !!(hasAnswers && hasLogs);

		return {
			accessToken: createAccessToken({ id: user.id }),
			user: response,
		};
	}

	async register() {
		const { body } = this.req;
		const { password } = body;

		body.password = await bcrypt.hash(password, 12);

		const user = await prisma.users.create({ 
			data: {
				status: ACCOUNT_STATUS.ACTIVE,
				role_id: 2,
				...body,
			} 
		});
		const updateRecord = this.publicProfile(user);

		const mailOptions = {
			to: user.email,
			subject: 'Welcome',
			text: 'Welcome to our platform',
			html: '<p>You have successfully registered to our platform</p>',
		};

		sendEmail(mailOptions);

		return this.publicProfile(updateRecord);
	}

	async guestLogin() {
		const guestUser = await prisma.users.create({
			data: {
				email: `guest_${Date.now()}@temp.com`,
				password: '',
				name: `Guest User ${Date.now()}`,
				status: ACCOUNT_STATUS.ACTIVE,
				role_id: 3
			}
		});

		return {
			accessToken: createAccessToken({ id: guestUser.id }),
			user: this.publicProfile(guestUser)
		};
	}

	async getLoggedInUser() {
		const { user } = this.req;
		return this.publicProfile(user);
	}

	async OtpVerify() {
		const { type } = this.req;
		const { id } = this.req.params;
		let updateData;
		let rememberToken;
		let updateRecord;

		if (type === 'reset') {
			rememberToken = createOtpToken({ userId: id, type });
			updateData = { remember_token: rememberToken };
		} else {
			updateData = { status: ACCOUNT_STATUS.ACTIVE, remember_token: null };
		}

		updateRecord = await prisma.users.update({
			where: { id: parseInt(id, 10) },
			data: updateData,
		});
		updateRecord = this.publicProfile(updateRecord);

		if (type === 'reset' && rememberToken) {
			updateRecord.resetToken = rememberToken;
		}

		return updateRecord;
	}

	async ResendOTP() {
		const { id } = this.req.params;
		const { query } = this.req;
		const type = query?.type && query.type === 'reset' ? 'reset' : 'verify';

		const updateRecord = await this.createOTP(id, type);

		return this.publicProfile(updateRecord);
	}

	// eslint-disable-next-line class-methods-use-this
	async createOTP(userID, type = 'verify') {
		const OTP = Math.floor(1000 + Math.random() * 9000);

		const rememberToken = createOtpToken({ userId: userID, OTP, type });
		const updateRecord = await prisma.users.update({
			where: {
				id: parseInt(userID, 10),
			},
			data: {
				remember_token: rememberToken,
			},
		});

		const mailOptions = {
			to: updateRecord.email,
			subject: 'OTP',
			text: 'Your One Time Password',
			html: `<p>Your one time password is ${OTP}.</p>`,
		};

		sendEmail(mailOptions);

		updateRecord.OTP = OTP;

		return updateRecord;
	}

	async ForgotPassword() {
		const { email } = this.req.body;

		const record = await prisma.users.findFirst({
			where: {
				deleted: false,
				email,
			},
		});

		const updateRecord = await this.createOTP(record.id, 'reset');

		return this.publicProfile(updateRecord);
	}

	async ResetPassword() {
		const { id } = this.req.params;
		const { password } = this.req.body;

		const passwordHash = await bcrypt.hash(password, 12);

		const updateRecord = await prisma.users.update({
			where: {
				id: parseInt(id, 10),
			},
			data: {
				password: passwordHash,
				remember_token: null,
			},
		});

		return this.publicProfile(updateRecord);
	}

	async googleSignIn() {
		const { body } = this.req;

		try {
			const existingUser = await prisma.users.findUnique({
				where: {
					email: body.email,
				},
			});

			if (existingUser) {
				const updatedUser = await prisma.users.update({
					where: {
						id: existingUser.id,
					},
					data: {
						last_login: new Date(),
					},
				});

				const existingMeta = await prisma.user_meta.findFirst({
					where: {
						user_id: existingUser.id,
						key: 'google',
					},
				});

				if (!existingMeta) {
					await prisma.user_meta.create({
						data: {
							user_id: existingUser.id,
							key: 'google',
							value: body.google_id,
						},
					});
				}

				const accessToken = createAccessToken({ id: existingUser.id });
				return { user: updatedUser, accessToken };
			}

			const newUser = await prisma.users.create({
				data: {
					email: body.email,
					name: body.name,
					image: body.imageUrl,
					status: ACCOUNT_STATUS.ACTIVE,
					last_login: new Date(),
				},
			});

			await prisma.user_meta.create({
				data: {
					user_id: newUser.id,
					key: 'google',
					value: body.google_id,
				},
			});

			if(body.response){
				await prisma.user_meta.create({
					data: {
						user_id: newUser.id,
						key: 'google_response',
						value: body.response,
					},
				});
			}

			await prisma.auth_log.create({
				data: {
					user_id: newUser.id,
					type: 'login',
				},
			});

			const accessToken = createAccessToken({ id: newUser.id });
			return { user: newUser, accessToken };
		} catch (error) {
			console.log(error);
			throw new Error(`Google sign in failed: ${error.message}`);
		}
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
