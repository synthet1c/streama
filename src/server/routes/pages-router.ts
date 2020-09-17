import { Request, Response, Router } from 'express';
import { getManifest } from './manifest-manager';

export function pagesRouter() {
  const router = Router();

  router.get(`/**`, async (req: Request, res: Response) => {
    const manifest = await getManifest();
    res.render('page.ejs', { manifest });
  });

  return router;
}
