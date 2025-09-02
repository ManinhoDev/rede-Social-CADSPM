"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_auth_middleware_1 = require("../middleware/supabase-auth.middleware");
const forum_controller_1 = require("../controllers/forum.controller");
const router = (0, express_1.Router)();
router.get('/topics', forum_controller_1.listTopics); // público
router.post('/topics', supabase_auth_middleware_1.supabaseAuthMiddleware, forum_controller_1.createTopic);
router.delete('/topics/:id', supabase_auth_middleware_1.supabaseAuthMiddleware, forum_controller_1.deleteTopic);
router.get('/topics/:topicoId/messages', forum_controller_1.listMessages);
router.post('/topics/:topicoId/messages', supabase_auth_middleware_1.supabaseAuthMiddleware, forum_controller_1.createMessage);
exports.default = router;
