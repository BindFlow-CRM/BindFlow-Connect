import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import webhooksRouter from "./webhooks.js";
import remindersRouter from "./reminders.js";
import supportRouter from "./support.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(webhooksRouter);
router.use(remindersRouter);
router.use(supportRouter);

export default router;
