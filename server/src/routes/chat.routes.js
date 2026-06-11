import { Router } from "express";
import {
  handleChat,
  getSessionOpeningQuestion,
} from "../controllers/chat.controller.js";

const router = Router();

router.post("/chat", handleChat);
router.get("/chat/session/:sessionId", getSessionOpeningQuestion);

export default router;
