//Establishing mongo db connection
const mongoose = require('mongoose')

mongoose.connect(process.env.DB, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log(`Connected to production database`))