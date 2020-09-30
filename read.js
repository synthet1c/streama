const fs = require('fs')
const filename = 'assets/frag_bunny.mp4'

console.log('exists', fs.existsSync(filename))

const readStream = fs.createReadStream(filename)

const trace = (tag) => (err, x) => (console.log(tag, err, x), x)

readStream.on('open', trace('open'))
readStream.on('data', trace('data'))
readStream.on('error', trace('error'))

