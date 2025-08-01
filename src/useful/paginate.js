const paginate = async (model, page = 1, limit = 10, where = {}, include = [], order = [["createdAt", "DESC"]]) => {
    // Assurer que les valeurs sont correctes
    const offset = (page - 1) * limit;

    // Exécuter la requête avec pagination
    const { count, rows } = await model.findAndCountAll({
        where, // Permet d'ajouter des filtres
        include, // Permet d'inclure d'autres modèles
        order, // Permet de trier les résultats
        limit,
        offset
    });

    return {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemPerPage: limit,
        items: rows,
        hasNextPage: page < Math.ceil(count / limit),
        hasPrevPage: page > 1
    };
};

export default paginate;