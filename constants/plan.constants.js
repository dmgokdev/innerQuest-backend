export const INVALID_PLAN_ID = 'Invalid Plan ID';
export const PLAN_NOT_FOUND = 'Plan Not Found';
export const GET_PLAN_SUCCESS = 'Plans fetched successfully';
export const PLAN_CREATED_SUCCESS = 'Plan created successfully';
export const PLAN_UPDATED_SUCCESS = 'Plan updated successfully';
export const PLAN_DELETED_SUCCESS = 'Plan deleted successfully';
export const PLAN_ALREADY_EXISTS = 'Plan already exists';

export const ALLOWED_PLAN_SORT_OPTIONS = [
	'id',
	'name',
	'description',
	'price',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_PLAN_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_PLAN_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_PLAN_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'name',
		type: 'string',
	},
	{
		propertyName: 'description',
		type: 'string',
	},
	{
		propertyName: 'price',
		type: 'number',
	},
	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_PLAN_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_PLAN_SORT_OPTIONS.includes(field);
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
