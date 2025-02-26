import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import responseTime from 'response-time';

import { PORT } from './config';
import {
	errorMiddleware,
	notFound,
	// rateLimiter
} from './middlewares';
import {
	AuthRoutes,
	UserRoutes,
	StepRoutes,
	PlanRoutes,
	PaymentRoutes,
	BusinessRoutes,
	QuestionRoutes,
	UserAnswersRoutes,
	UserAnswersLogsRoutes
} from './routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(rateLimiter);
app.use(compression());
app.use(morgan('dev'));
app.use(responseTime());

app.use(cors({ origin: '*' }));

app.use('/public', express.static(path.join(path.resolve(), 'temp_uploads')));
app.use(express.static(path.join(path.resolve(), 'public')));

app.use(helmet());

app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/business', BusinessRoutes);
app.use('/api/v1/payments', PaymentRoutes);
app.use('/api/v1/plans', PlanRoutes);
app.use('/api/v1/questions', QuestionRoutes);
app.use('/api/v1/steps', StepRoutes);
app.use('/api/v1/user/answers', UserAnswersRoutes);
app.use('/api/v1/users', UserRoutes);
app.use('/api/v1/user/answer-logs', UserAnswersLogsRoutes);

app.get('/home', (req, res) => {
	res.status(200).json({ data: 'Server is running' });
});

// app.get('/foldertest', (req, res) => {
// 	const crudName = 'plan';
// 	const replacements = ['Plan','PLAN','plan','.plans.'];
// 	const folders = ['constants', 'controllers', 'routes', 'validations', 'services'];

// 	folders.forEach((folder) => {
// 	    const sourceFilePath = path.join(__dirname, folder, `step.${folder}.js`);
// 	    const destinationFileName = `${crudName}.${folder}.js`;
// 	    const destinationFilePath = path.join(__dirname, folder, destinationFileName);
// 	    const indexFilePath = path.join(__dirname, folder, 'index.js');

// 	    fs.copyFile(sourceFilePath, destinationFilePath, (err) => {
// 	        if (!err) {
// 	            console.log(`File copied in ${folder} as ${destinationFileName}`);

// 				fs.copyFile(sourceFilePath, destinationFilePath, err => {
// 					if (!err) {
// 						console.log(`File copied in ${folder} as ${destinationFileName}`);
		
// 						fs.readFile(destinationFilePath, 'utf8', (readErr, data) => {
// 							if (!readErr) {
// 								const updatedContent = data
// 									.replace(/\.steps\./g, replacements[3])
// 									.replace(/Step/g, replacements[0])
// 									.replace(/STEP/g, replacements[1])
// 									.replace(/step/g, replacements[2]);
		
// 								fs.writeFile(
// 									destinationFilePath,
// 									updatedContent,
// 									'utf8',
// 									writeErr => {
// 										if (writeErr) {
// 											console.error(`Error writing file in ${folder}:`, writeErr);
// 										} else {
// 											console.log(`File updated in ${folder} with replacements`);
		
// 											const exportLine = `export * from './${crudName}.${folder}';\n`;
// 											fs.appendFile(indexFilePath, exportLine, appendErr => {
// 												if (appendErr) {
// 													console.error(
// 														`Error appending to index.js in ${folder}:`,
// 														appendErr,
// 													);
// 												} else {
// 													console.log(`Export line added to index.js in ${folder}`);
// 												}
// 											});
// 										}
// 									},
// 								);
// 							} else {
// 								console.error(`Error reading file in ${folder}:`, readErr);
// 							}
// 						});
// 					} else {
// 						console.error(`Error copying file in ${folder}:`, err);
// 					}
// 				});
// 	        } else {
// 	            console.error(`Error copying file in ${folder}:`, err);
// 	        }
// 	    });
// 	});

// 	res.status(200).json({ data: 'Files copied, updated, and export line added successfully' });
// });

app.use('*', notFound);
app.use(errorMiddleware);

if (!fs.existsSync('./temp_uploads')) {
	fs.mkdirSync('./temp_uploads', { recursive: true });
	// eslint-disable-next-line no-console
	console.log('temp_uploads folder created!');
}

app.listen(PORT || 3000, () => {
	// eslint-disable-next-line no-console
	console.log(`Server is listening at port ${PORT}`);
});
