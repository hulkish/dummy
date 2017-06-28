import path from 'path';
// import http2 from 'http2';
import Koa from 'koa';
import fs from 'fs';
import https from 'https';
import send from 'koa-send';

const app = new Koa();

const options = {
  key: fs.readFileSync(path.resolve('certs/localhost.key')),
  cert: fs.readFileSync(path.resolve('certs/localhost.crt')),
};

app.use(async (ctx, next) => {
  await send(ctx, ctx.path, {
    maxage: 60 * 60 * 24 * 1000,
    root: path.resolve(__dirname, 'dist')
  });
  console.log(ctx.response)
  ctx.status = 200;
  await next();
});

https.createServer(options, app.callback()).listen(3000, function(err) {
  if (err) {
    throw new Error(err);
  }

  const { family, address, port } = this.address();

  console.log('Listening on: %s %s:%s', family, address, port);
});



