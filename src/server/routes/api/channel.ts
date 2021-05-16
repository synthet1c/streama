import { Router, Request, Response } from 'express';
import { DB } from '../../db/index';
import { User } from '../../models/User';
import Channel from '../../classes/Channel';

export const router = Router();

const exclude = (...fields) => '-' + fields.join(' -')

router.get('/list', async (req: Request, res: Response) => {
  try {
    const channels = await DB.Models.Channel.find({})
      .select(exclude('__v', '_id'))
      .populate({
        path: 'owner',
        model: DB.Models.User,
        select: exclude('__v', '_id', 'email', 'sessionId', 'groups')
      });

    res.status(200)
      .json({
        success: true,
        data: channels,
      });
  } catch (err: any) {
    res
      .status(500)
      .json({
        success: false,
        message: err.message,
      });
  }
});

router.get('/create', async (req: Request, res: Response) => {

  const user = await DB.Models.User.findOne({
    login: 'foonta'
  });

  const channel = await DB.Models.Channel.create({
    name: 'Foonta Loompa Doompa',
    slug: 'foontaloompa',
    owner: user._id
  })

  res
    .status(200)
    .json({
      success: true,
      data: channel
    });
});

router.get('/clear', async (req: Request, res: Response) => {

  await DB.Models.Channel.collection.drop()

  res.json({
    success: true,
    message: 'Channels deleted',
  });
})



router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const channel = await DB.Models.Channel
      .findOne({
        slug: req.params.slug,
      })
      .populate({
        path: 'owner',
        model: User
      });

    if (!channel) {
      return res.status(404)
        .json({
          success: false,
          message: `Channel ${req.params.slug} not found`
        })
    }

    return res
      .status(200)
      .json({
        success: true,
        data: channel,
      });
  } catch (err: any) {
    res
      .status(500)
      .json({
        success: false,
        error: err.message,
      });
  }
});
