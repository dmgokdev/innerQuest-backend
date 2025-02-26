export const INVALID_BUSINESS_ID = 'Invalid Business ID';
export const BUSINESS_NOT_FOUND = 'Business Not Found';
export const GET_BUSINESS_SUCCESS = 'Businesss fetched successfully';
export const BUSINESS_CREATED_SUCCESS = 'Business created successfully';
export const BUSINESS_UPDATED_SUCCESS = 'Business updated successfully';
export const BUSINESS_DELETED_SUCCESS = 'Business deleted successfully';
export const BUSINESS_ALREADY_EXISTS = 'Business already exists';

export const ALLOWED_BUSINESS_SORT_OPTIONS = [
	'id',
	'user',
	'plan_id',
	'description',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_BUSINESS_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_BUSINESS_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_BUSINESS_QUERY_SCHEMA_CONFIG = [
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
			message: INVALID_BUSINESS_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_BUSINESS_SORT_OPTIONS.includes(field);
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
