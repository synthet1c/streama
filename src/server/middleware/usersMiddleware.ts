import { Request, Response } from 'express';
import { DB } from '../db';

export const usersMiddleware = async (req: Request, res: Response, next) => {
  if (req.session.user) {
    req.session.user = await DB.Models.User.findById(req.session.user._id)
      .populate({
        path: 'groups',
        model: DB.Models.Group,
      })
  }
  next()
}
