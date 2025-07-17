"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    console.error({
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        params: req.params,
        query: req.query,
        body: req.body,
    });
    res.status(500).json({ message: 'An internal server error occurred.' });
};
exports.errorHandler = errorHandler;
