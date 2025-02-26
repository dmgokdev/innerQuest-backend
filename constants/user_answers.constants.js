export const INVALID_USERANSWERS_ID = 'Invalid UserAnswers ID';
export const USERANSWERS_NOT_FOUND = 'UserAnswers Not Found';
export const GET_USERANSWERS_SUCCESS = 'UserAnswers fetched successfully';
export const USERANSWERS_CREATED_SUCCESS = 'Answer Submitted successfully';
export const USERANSWERS_UPDATED_SUCCESS = 'UserAnswers updated successfully';
export const USERANSWERS_DELETED_SUCCESS = 'UserAnswers deleted successfully';
export const USERANSWERS_ALREADY_EXISTS = 'UserAnswers already exists';
export const BUSSINESS_IDEA_GENERATED = 'Bussiness Idea Generated successfully';

export const ALLOWED_USERANSWERS_SORT_OPTIONS = [
	'id',
	'answer',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_USERANSWERS_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_USERANSWERS_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_USERANSWERS_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'answer',
		type: 'string',
	},
	{
		propertyName: 'user_id',
		type: 'string',
	},
	{
		propertyName: 'question_id',
		type: 'string',
	},
	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_USERANSWERS_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_USERANSWERS_SORT_OPTIONS.includes(field);
				const isValidDirection = ALLOWED_SORT_DIRECTION.includes(direction);
				return isValidField && isValidDirection;
			},
		},
	},
	{
		propertyName: 'page',
		type: 'number',
		min: 1,
	},
	{
		propertyName: 'limit',
		type: 'number',
		min: 1,
	},
];
