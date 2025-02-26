export const INVALID_QUESTION_ID = 'Invalid Question ID';
export const QUESTION_NOT_FOUND = 'Question Not Found';
export const GET_QUESTION_SUCCESS = 'Questions fetched successfully';
export const QUESTION_CREATED_SUCCESS = 'Question created successfully';
export const QUESTION_UPDATED_SUCCESS = 'Question updated successfully';
export const QUESTION_DELETED_SUCCESS = 'Question deleted successfully';
export const QUESTION_ALREADY_EXISTS = 'Question already exists';

export const ALLOWED_QUESTION_SORT_OPTIONS = [
	'id',
	'title',
	'description',
	'sort',
	'step_id',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_QUESTION_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_QUESTION_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_QUESTION_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'title',
		type: 'string',
	},
	{
		propertyName: 'description',
		type: 'string',
	},
	{
		propertyName: 'step_id',
		type: 'number',
	},
	{
		propertyName: 'user_id',
		type: 'number',
	},
	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_QUESTION_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_QUESTION_SORT_OPTIONS.includes(field);
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
