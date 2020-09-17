import bodyParser from 'body-parser';
import { Router, Request, Response } from 'express';
import { DB } from '../../db/index';
import { mongoifyQuery } from '../../utils/mongoifyQuery';
import { LEVELS } from '../../models/Group';
import { authenticate } from '../../utils/authenticate';

const userRouter = Router();

userRouter.post('/create', async (req: Request, res: Response) => {
  try {
    const contact = await DB.Models.User.create({
      name: req.body.name,
      email: req.body.email,
      login: req.body.login,
    });

    res
      .status(200)
      .json({
        success: true,
        data: contact,
        message: 'New user created'
      });

  } catch (err: any) {
    res
      .status(403)
      .json({
        success: false,
        message: err.message,
      });
  }
});

userRouter.get('/clear', async (req: Request, res: Response) => {

  await DB.Models.User.collection.drop();

  res.json({
    success: true,
    message: 'Users deleted',
  });
});


userRouter.get('/list', async (req: Request, res: Response) => {
  const query = mongoifyQuery(req.query);
  try {
    const users = await DB.Models.User.find(query)
      .select('-_id -__v -groups -sessionId')
    res
      .status(200)
      .json({
        success: true,
        data: users,
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

userRouter.get('/add-group', async (req: Request, res: Response) => {
  try {
    const group = await DB.Models.Group.create({
      name: 'Foontas group',
      level: LEVELS.GOD_MODE,
    });

    const user = await DB.Models.User.findOne({
      login: 'foonta',
    });

    user.groups.push(group._id);
    const result = await user.save();

    res
      .status(200)
      .json({
        success: true,
        data: result,
      });
  } catch (e: any) {
    res
      .status(500)
      .json({
        success: false,
        message: e.message,
      });
  }
});

userRouter.get('/login', async (req: Request, res: Response) => {
  try {
    const user = await DB.Models.User.findOne({
      login: 'foonta',
    });
    req.session.expires = new Date(Date.now() + 3600000);
    req.session.user = user;
    await user.loginUser(req.sessionID);
    res.json({
      success: true,
      data: user,
      message: 'Successfully logged in',
      code: 210,
    });
  } catch (e: any) {

  }
});

userRouter.get('/logout', async (req: Request, res: Response) => {
  try {
    const user = await DB.Models.User.findOne({
      login: 'foonta',
    });
    req.session.expires = new Date(0);
    req.session.user = null;
    await user.logoutUser();
    res.json({
      success: true,
      message: 'Successfully logged out',
      code: 211,
    });
  } catch (e: any) {

  }
});



userRouter.get('/private', authenticate(LEVELS.GOD_MODE), (req: Request, res: Response) => {
  res
    .status(200)
    .json({
      success: true,
      message: `You are authenticated`,
      status: 200,
      code: 200,
    });
});



userRouter.get('/:userLogin', async (req: Request, res: Response) => {
  try {
    const user = await DB.Models.User.findOne({
      login: req.params.userLogin,
    })
      .populate({
        path: 'groups',
        model: DB.Models.Group,
      });
    res
      .status(200)
      .json({
        success: true,
        data: user,
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

export {
  userRouter,
};
