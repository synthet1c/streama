import express, { Request, Response } from 'express';
import path from 'path';
import { pagesRouter } from './routes/pages-router';
import { staticsRouter } from './routes/statics-router';
import { apiRouter} from './routes/api';
import session from 'express-session'
import * as config from './config';
import { createServer } from 'http'
import socketIO, { Socket } from 'socket.io'
import dotenv from 'dotenv'
import nodeMediaServer from './mediaServer'

dotenv.config()

import Node from './classes/Node';
import { usersMiddleware } from './middleware/usersMiddleware';

console.log(`*******************************************`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`config: ${JSON.stringify(config, null, 2)}`);
console.log(`*******************************************`);


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
})

app.set('view engine', 'ejs');

app.use(sessionMiddleware)

app.use(usersMiddleware)

io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res, next)
})

io.on('connection', (socket: Socket) => {
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
    user: 'AYO',
  })
})

app.use('/assets', express.static(path.join(process.cwd(), 'assets')));
app.use('/api', apiRouter);
app.use(staticsRouter());
app.use(pagesRouter());

server.listen(config.SERVER_PORT, () => {
  console.log(`App listening on port ${config.SERVER_PORT}!`);
});

nodeMediaServer.run()
