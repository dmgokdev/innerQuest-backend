export const reorderSequentially = async (
	prismaClient,
	modelName,
	whereClause = {},
) => {
	const items = await prismaClient[modelName].findMany({
		where: whereClause,
		orderBy: { sort: 'asc' },
	});

	if (!items || items.length === 0) {
		throw new Error(`No items found for model: ${modelName}`);
	}

	const updatedItems = items.map((item, index) => ({
		id: item.id,
		sort: index + 1,
	}));

	await Promise.all(
		updatedItems.map(item =>
			prismaClient[modelName].update({
				where: { id: item.id },
				data: { sort: item.sort },
			}),
		),
	);
};
