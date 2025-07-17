"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleIdentify = void 0;
const identity_service_1 = require("../services/identity.service");
const handleIdentify = async (req, res, next) => {
    const { email, phoneNumber } = req.body;
    if (!email && !phoneNumber) {
        return res.status(400).json({ message: 'Email or phone number must be provided.' });
    }
    try {
        const result = await (0, identity_service_1.identify)({ email, phoneNumber });
        return res.status(200).json(result);
    }
    catch (error) {
        return next(error);
    }
};
exports.handleIdentify = handleIdentify;
