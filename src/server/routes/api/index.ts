import { Router } from 'express';
import bodyParser from 'body-parser';
import { router as channelRouter } from './channel';
import { router as userRouter } from './user';
import { router as notificationRouter } from './notifications';

const apiRouter = Router()

apiRouter.use(bodyParser.json());

apiRouter.use('/channel', channelRouter)
apiRouter.use('/user', userRouter)
apiRouter.use('/notifications', notificationRouter)

export { apiRouter }
