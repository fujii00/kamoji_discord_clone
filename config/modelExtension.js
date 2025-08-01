import {Sequelize} from "sequelize";

Sequelize.Model.paginate = async function(options = {}) {
    const {
        page = 1,
        limit = 10,
        where = {},
        include = [],
        order = [['createdAt', 'DESC']],
        attributes
    } = options;

    const offset = (page - 1) * limit;

    const { count, rows } = await this.findAndCountAll({
        where,
        include,
        order,
        limit,
        offset,
        attributes,
        distinct: true
    });

    return {
        items: rows,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(count / limit),
        hasPrevPage: page > 1
    };
};