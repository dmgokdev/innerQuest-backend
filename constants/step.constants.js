export const INVALID_STEP_ID = 'Invalid Step ID';
export const STEP_NOT_FOUND = 'Step Not Found';
export const GET_STEP_SUCCESS = 'Steps fetched successfully';
export const STEP_CREATED_SUCCESS = 'Step created successfully';
export const STEP_UPDATED_SUCCESS = 'Step updated successfully';
export const STEP_DELETED_SUCCESS = 'Step deleted successfully';
export const STEP_ALREADY_EXISTS = 'Step already exists';

export const ALLOWED_STEP_SORT_OPTIONS = [
	'id',
	'name',
	'title',
	'description',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_STEP_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_STEP_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_STEP_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'name',
		type: 'string',
	},
	{
		propertyName: 'title',
		type: 'string',
	},
	{
		propertyName: 'description',
		type: 'string',
	},
	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_STEP_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_STEP_SORT_OPTIONS.includes(field);
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
