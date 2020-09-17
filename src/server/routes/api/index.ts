import { channelRouter } from './channel';
import { userRouter } from './user';
import { Router } from 'express';
import bodyParser from 'body-parser';

const apiRouter = Router()

apiRouter.use(bodyParser.json());

apiRouter.use('/channel', channelRouter)
apiRouter.use('/user', userRouter)

export { apiRouter }
