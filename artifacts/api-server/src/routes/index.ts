import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import webhooksRouter from "./webhooks.js";
import remindersRouter from "./reminders.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(webhooksRouter);
router.use(remindersRouter);

export default router;
