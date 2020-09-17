import { Router, Request, Response } from 'express';

export function rtcRouter() {
  const router = Router();

  router.get('/rtc/connect', (req: Request, res: Response) => {
    res.json({ rtc: true, sessionId: req.sessionID });
  });

  return router;
}
