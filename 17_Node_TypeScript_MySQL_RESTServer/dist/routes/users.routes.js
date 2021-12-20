"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
router.get('/', user_controller_1.getUsers);
router.get('/:id', user_controller_1.getUser);
router.post('/', user_controller_1.postUser);
router.put('/:id', user_controller_1.putUser);
router.delete('/partial-delete/:id', user_controller_1.partialDeleteUser);
router.delete('/total-delete/:id', user_controller_1.totalDeleteUser);
exports.default = router;
//# sourceMappingURL=users.routes.js.map