export const parseIdParam = (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).send({ error: 'Invalid ID param' });
    }
        else{
            req.params.id = id; // Store the parsed ID back in the request params
            next(); // Call the next middleware or route handler
        }
    
}