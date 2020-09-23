import express, { Request, Response } from 'express';
import path from 'path';
import { pagesRouter } from './routes/pages-router';
import { staticsRouter } from './routes/statics-router';
import { apiRouter} from './routes/api';
import session from 'express-session'
import * as config from './config';
import { createServer } from 'http'
import socketIO, { Socket } from 'socket.io'
import jsonParser from 'socket.io-json-parser'
import { l337Crypt } from './utils/l337Cript';
import dotenv from 'dotenv'

dotenv.config()

import ClientManager from './classes/ClientManager';
import Client from './classes/Client';
import Node from './classes/Node';
import { DB } from './db/index';

console.log(`*******************************************`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`config: ${JSON.stringify(config, null, 2)}`);
console.log(`*******************************************`);

const trace = (tag: string) => (x: any) => (console.log(tag, x), x)

const app = express();
const server = createServer(app)
const io = socketIO(server)

const sessionMiddleware = session({
  resave: true,
  saveUninitialized: true,
  secret: 'Who\'s the baddest of them all?',
  cookie: {
    secure: false,
    sameSite: true,
  },
  genid: (req: Request) => {
    console.log('Session id', req.query.name)
    return String(req.query.name)
  }
})

const manager = new ClientManager

app.set('view engine', 'ejs');

app.use(sessionMiddleware)

app.use(async (req: Request, res: Response, next) => {
  if (req.session.user) {
    req.session.user = await DB.Models.User.findById(req.session.user._id)
      .populate({
        path: 'groups',
        model: DB.Models.Group,
      })
  }
  next()
})

io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res, next)
})

io.on('connection', (socket: Socket) => {
  manager.addClient(new Client({ id: socket.id, socket }))

  const node = new Node({
    sessionId: socket.request.sessionID,
    req: socket.request,
    res: socket.request.res,
    socket,
    io,
  })

  socket.emit('message', {
    id: Date.now().toString(16),
    createdAt: Date.now(),
    content: 'Welcome!',
    title: 'Welcome!',
    user: 'AYO'
})

  // socket.on('disconnect', () => {
  //   manager.removeClient(trace('Client::disconnect')(Client.getBySessionId(socket.id)))
  //   console.log('io:disconnected', socket, manager)
  // })
})


// app.use(useClient())

app.use('/assets', express.static(path.join(process.cwd(), 'assets')));
app.use('/api', apiRouter);
app.use(staticsRouter());
app.use(pagesRouter());

server.listen(config.SERVER_PORT, () => {
  console.log(`App listening on port ${config.SERVER_PORT}!`);
});
