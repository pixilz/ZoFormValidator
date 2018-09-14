const koa = require('koa'),
  serve = require('koa-static'),
  route = require('koa-route'),
  views = require('koa-views');

const app = new koa();

const PORT = 3000;

console.log(`Server Started... @ localhost:${PORT}`);

// x-response-time

// Tracks total response time for all middleware to load.
app.use(async (ctx, next) => {
  const start = Date.now();

  await next();

  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

app.use(views(`${__dirname}/views`, {extension: 'pug'}));

// logger

// Logs out the HTTP Request Method and the url.
app.use(async (ctx, next) => {
  await next();

  let format = ':method - :status ":url"';
  const output = format
    .replace(':method', ctx.method)
    .replace(':url', ctx.url)
    .replace(':status', ctx.status);

  console.log(output);
});

app.use(serve('public', {extensions: ['js', 'css']}));
// app.use(serve('pages', {extensions: ['html']}));

app.use(route.get('/', async (ctx) => {
  await ctx.render('index')
}));

if (!module.parent) {
  app.listen(PORT);
}
