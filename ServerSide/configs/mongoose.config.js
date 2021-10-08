const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/WEB601-DB', {
    useNewUrlParser: true,
})
.then(() => {
    console.log('Mongoose connected to "WEB601-DB" database')
}).catch((err) => console.log(err.message));

mongoose.connection.on('error', (err) => {
    console.log(err.message)
});

mongoose.connection.on('disconnected', () => { 
    console.log('Mongoose connection disconnected')
});

process.on('SIGINT', async () => {
    await mongoose.connection.close()
    process.exit(0)
});