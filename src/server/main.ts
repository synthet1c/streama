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
// import nodeMediaServer from './mediaServer'
import Heap, { Node as HNode } from './datastructures/heap'
import { default as fheap } from './utils/heap'

dotenv.config()

import Node from './classes/Node';
import { usersMiddleware } from './middleware/usersMiddleware';
import Channel from './classes/Channel';

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

// app.use(usersMiddleware)

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

// nodeMediaServer.run()

// const heapA = new Heap(2, (differences => {
//   console.log('differences', differences)
// }))
// const testNodeA = new HNode({ id: 4, score: 100 })
// heapA.insert(new HNode({ id: 1, score: 70 }))
// heapA.insert(new HNode({ id: 2, score: 50 }))
// heapA.insert(new HNode({ id: 3, score: 80 }))
// heapA.insert(testNodeA)
// heapA.insert(new HNode({ id: 5, score: 60 }))
// heapA.insert(new HNode({ id: 6, score: 40 }))
// heapA.insert(new HNode({ id: 7, score: 67 }))
// heapA.insert(new HNode({ id: 8, score: 67 }))
// heapA.insert(new HNode({ id: 9, score: 62 }))
// heapA.insert(new HNode({ id: 10, score: 57 }))
// heapA.insert(new HNode({ id: 11, score: 77 }))
// heapA.insert(new HNode({ id: 12, score: 69 }))
// heapA.insert(new HNode({ id: 13, score: 87 }))
// heapA.insert(new HNode({ id: 14, score: 47 }))
// heapA.insert(new HNode({ id: 17, score: 37 }))
// heapA.insert(new HNode({ id: 16, score: 27 }))

// const a = heapA.heap.slice()

// console.log('heapA', a)

// const left = (heap, index) => heap[(index * 2) + 1]
// const right = (heap, index) => heap[(index * 2) + 2]
// const parent = (heap, index) => heap[Math.floor((index - 1) / 2)]
//
// const heapB = new Heap(2)
// const testNodeB = new HNode({ id: 4, connection: 100 })
// heapB.insert(new HNode({ id: 1, connection: 70 }))
// heapB.insert(new HNode({ id: 2, connection: 50 }))
// heapB.insert(new HNode({ id: 3, connection: 80 }))
// heapB.insert(testNodeB)
// heapB.insert(new HNode({ id: 5, connection: 60 }))
// heapB.insert(new HNode({ id: 6, connection: 40 }))
// heapB.insert(new HNode({ id: 7, connection: 75 }))
//
// const b = heapB.heap.slice()
//
// console.log('heapB', b)
//
// for (
//   let i = 0;
//   i < Math.max(a.length, b.length);
//   i++
// ) {
//   if (a[i].id !== b[i].id) {
//     console.log('changed', {
//       node: a[i],
//       left: left(a, i),
//       right: right(a, i),
//       parent: parent(a, i),
//     }, {
//       node: b[i],
//       left: left(b, i),
//       right: right(b, i),
//       parent: parent(b, i),
//     })
//   } else {
//     console.log('same')
//   }
// }

// let aheap = []
// aheap = fheap.insert(aheap, { id: 1, score: 200 })
// aheap = fheap.insert(aheap, { id: 2, score: 70 })
// aheap = fheap.insert(aheap, { id: 3, score: 100 })
// aheap = fheap.insert(aheap, { id: 4, score: 60 })
// aheap = fheap.insert(aheap, { id: 5, score: 70 })
// aheap = fheap.insert(aheap, { id: 6, score: 50 })
// aheap = fheap.insert(aheap, { id: 7, score: 40 })
// aheap = fheap.insert(aheap, { id: 8, score: 67 })
// aheap = fheap.insert(aheap, { id: 9, score: 67 })
// aheap = fheap.insert(aheap, { id: 10, score: 57 })
// aheap = fheap.insert(aheap, { id: 11, score: 77 })
// aheap = fheap.insert(aheap, { id: 12, score: 69 })
// aheap = fheap.insert(aheap, { id: 13, score: 87 })
// aheap = fheap.insert(aheap, { id: 14, score: 47 })
// aheap = fheap.insert(aheap, { id: 17, score: 37 })
// aheap = fheap.insert(aheap, { id: 16, score: 27 })
// console.log('aheap', aheap)
