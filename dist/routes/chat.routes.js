"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const supabase_auth_middleware_1 = require("../middleware/supabase-auth.middleware");
const router = (0, express_1.Router)();
router.get('/:otherUserId/messages', supabase_auth_middleware_1.supabaseAuthMiddleware, chat_controller_1.listMessages);
router.post('/:otherUserId/messages', supabase_auth_middleware_1.supabaseAuthMiddleware, chat_controller_1.sendMessage);
exports.default = router;
