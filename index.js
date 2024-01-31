const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();
const authRoute = require('./Routes/auth.route');
const quizeRoute = require('./Routes/quize.route');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(cors(
    {
        origin:["https://quizze-app-supriya.netlify.app"],
        methods:["POST","GET","PUT"],
        credentials:true
    }
));
app.use(bodyParser.json({ limit: '10mb' }))

app.set('view engine', 'ejs');

app.get('/health', (req, res) => {
    res.status(200).json({
        status: "SUCESS",
        message: "All Good"
    })
})

// Api to register and lohin user
app.use('/auth', authRoute);

// Api to create a new Job
app.use('/quiz', quizeRoute)


app.listen(process.env.PORT, () => {
    mongoose.connect(process.env.MONGODB_URL)
        .then(() => console.log(`Server running at http://localhost:${process.env.PORT}`))
        .catch((error) => console.log(error))
})
