const express = require('express');
const mongoose = require('mongoose');
const exphds = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const path = require('node:path');
const csrf = require('csurf');
const flash = require('connect-flash');
const compression = require('compression');
// const helmet = require('helmet');
const fileMiddleware = require('./middleware/file.js');
const error404Middleware = require('./middleware/error404.js');
const varMiddleware = require('./middleware/variables.js');
const userMiddleware = require('./middleware/user.js');
const profileRoutes = require('./routes/profile.js');
const outhRoutes = require('./routes/auth.js');
const ordersRoutes = require('./routes/orders.js');
const homeRoutes = require('./routes/home.js');
const cardRoutes = require('./routes/card.js');
const addRoutes = require('./routes/add.js');
const coursesRoutes = require('./routes/courses.js');
const keys = require('./keys/index.js');

const app = express();
// work with Handebars start
const hbs = exphds.create({
  defaultLayout: 'main',
  extname: 'hbs',
  helpers: require('./utils/hbs-helpers'),
});
//own router user
// створюємо класс
const store = new MongoStore({
  collection: 'sessions',
  uri: keys.MONGODB_URI,
});
//end
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.urlencoded({ extended: true }));
// end handebars
//установка сесіїї start можемо зберігати дані в сесії
app.use(
  session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
  })
);
// end
app.use(fileMiddleware.single('avatar'));
app.use(csrf());
app.use(flash());
// app.use(helmet());
app.use(compression());
app.use(varMiddleware);
app.use(userMiddleware);

app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/courses', coursesRoutes);
app.use('/card', cardRoutes);
app.use('/orders', ordersRoutes);
app.use('/auth', outhRoutes);
app.use('/profile', profileRoutes);

app.use(error404Middleware);

const PORT = process.env.PORT || 5000;

//запуск mongoose
async function start() {
  try {
    await mongoose.connect(keys.MONGODB_URI, {});

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
}
start();
