export const INVALID_USERANSWERSLOGS_ID = 'Invalid UserAnswersLogs ID';
export const USERANSWERSLOGS_NOT_FOUND = 'UserAnswersLogs Not Found';
export const GET_USERANSWERSLOGS_SUCCESS =
	'UserAnswersLogs fetched successfully';
export const USERANSWERSLOGS_CREATED_SUCCESS = 'Answer Submitted successfully';
export const USERANSWERSLOGS_UPDATED_SUCCESS =
	'UserAnswersLogs updated successfully';
export const USERANSWERSLOGS_DELETED_SUCCESS =
	'UserAnswersLogs deleted successfully';
export const USERANSWERSLOGS_ALREADY_EXISTS = 'UserAnswersLogs already exists';

export const ALLOWED_USERANSWERSLOGS_SORT_OPTIONS = [
	'user_id',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_USERANSWERSLOGS_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_USERANSWERSLOGS_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_USERANSWERSLOGS_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'user_id',
		type: 'string',
	},
	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_USERANSWERSLOGS_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField =
					ALLOWED_USERANSWERSLOGS_SORT_OPTIONS.includes(field);
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
