import { Router, Request, Response } from 'express';
import { DB } from '../db/index';
import { User } from '../models/User';
import Channel from '../classes/Channel';
import Node from '../classes/Node';

export const router = Router();

router.get('/channel/:slug', async (req: Request, res: Response) => {

  const channel = await Channel.getChannel(req.params.slug)
  const node = Node.getNode(req.sessionID)

  channel.addViewer(node)

})

