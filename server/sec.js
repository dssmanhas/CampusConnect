import { randomBytes } from 'crypto';
randomBytes(64, (err, buffer) => {
  if (err) throw err;
  console.log(buffer.toString('hex'));
});
