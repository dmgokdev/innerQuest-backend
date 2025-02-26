export const INVALID_PAYMENT_ID = 'Invalid PAYMENT ID';
export const PAYMENT_NOT_FOUND = 'PAYMENT Not Found';
export const GET_PAYMENT_SUCCESS = 'PAYMENTs fetched successfully';
export const PAYMENT_CREATED_SUCCESS = 'PAYMENT created successfully';
export const PAYMENT_UPDATED_SUCCESS = 'PAYMENT updated successfully';
export const PAYMENT_DELETED_SUCCESS = 'PAYMENT deleted successfully';
export const PAYMENT_INTENT_CREATED = 'Payment intent created successfully';
export const PAYMENT_CONFIRMED = 'your payment has been confirmed';

export const ALLOWED_PAYMENT_SORT_OPTIONS = [
	'id',
	'order_id',
	'amount',
	'status',
	'description',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_PAYMENT_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_PAYMENT_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_PAYMENT_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'order_id',
		type: 'number',
	},
	{
		propertyName: 'amount',
		type: 'number',
	},
	{
		propertyName: 'status',
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
			message: INVALID_PAYMENT_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = INVALID_PAYMENT_SORT_OPTION.includes(field);
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
