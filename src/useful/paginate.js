const paginate = async (model, options = {}) => {
    const {
        page,
        where, // Permet d'ajouter des filtres
        include, // Permet d'inclure d'autres modèles
        order, // Permet de trier les résultats
        limit
    } = {
        page: 1,
        limit: parseInt(process.env.PAGINATION_MAX_ROWS) || 10,
        where: {},
        include: [],
        order: [["createdAt", "DESC"]],
        ...options
    }

    const offset = (page - 1) * limit

    // Exécuter la requête avec pagination
    const { count, rows } = await model.findAndCountAll({
        where, // Permet d'ajouter des filtres
        include, // Permet d'inclure d'autres modèles
        order, // Permet de trier les résultats
        limit,
        offset
    })

    return {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemPerPage: limit,
        items: rows,
        hasNextPage: page < Math.ceil(count / limit),
        hasPrevPage: page > 1
    }
}

export default paginate;