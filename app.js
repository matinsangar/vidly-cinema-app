require('express-async-errors'); //amazing way to catch errors at runtime without using try/catch blocks in your async functions
const express = require('express');
const app = express();
const helmet = require('helmet');
const morgan = require('morgan');
const winston = require('winston');
require('winston-mongodb');
const bodyParser = require('body-parser');
//routers
const genres = require('./routes/genres');
const home = require('./routes/home');
const members = require('./routes/members');
const movies = require('./routes/movies');
const rentals = require('./routes/rental');
const users = require('./routes/users');
const auth = require('./routes/auth');

app.use('/api/genres', genres);
app.use('/', home);
app.use('/api/members', members);
app.use('/api/movies', movies);
app.use('/api/rentals', rentals);
app.use('/api/users', users);
app.use('/api/auth', auth);
const startUpDebugger = require('debug')("app:startup");
//MongoDB
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/vildy')
    .then(() => console.log("connected"))
    .catch(err => console.error(err))
    .finally(() => console.log("Finished task"));

//config
const config = require('config');
console.log("The app name is: ", config.get('name'));
console.log("The Mail Server is: ", config.get('mail'));

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
if (process.env.NODE_ENV === "development") {
    console.log("Morgan is active....");
    app.use(morgan('tiny'));
    startUpDebugger("HELLO now we are in startUp debugger in development mode");
}

winston.configure({
    transports: [
        new winston.transports.File({ filename: 'logfile.log' }),
        new winston.transports.Console(),   //for tracking in console 
        new winston.transports.MongoDB({
            db: 'mongodb://localhost/vildy',
            collection: 'logs',
            storeHost: true,
            options: { useUnifiedTopology: true },
        })
    ]
})

// winston.ExceptionHandler(new winston.transports.File({ filename: 'ExpHandler.log' }));
// winston.RejectionHandler(new winston.transports.File({ filename: 'RjctHandler.log' }));


//middlewares
const auth_middleware = require('./middlewares/auth');
const error_middleware = require('./middlewares/error');
app.use(auth_middleware);
app.use(error_middleware);

const result = config.get("jwtPrivateKey");
if (!result) {
    console.error("jwtPrivateKey is not defined");
    process.exit(1); //failure so EXIT
}


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});