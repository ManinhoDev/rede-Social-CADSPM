"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminSupabase = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // anon key
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // opcional, NÃO expor no frontend
if (!supabaseUrl || !supabaseKey) {
    throw new Error('As variáveis de ambiente SUPABASE_URL e SUPABASE_KEY são obrigatórias');
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
exports.adminSupabase = serviceRoleKey ? (0, supabase_js_1.createClient)(supabaseUrl, serviceRoleKey) : null;
