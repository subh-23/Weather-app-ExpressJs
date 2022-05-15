const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

//middleware set 
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}))

const weatherRoute = require("./routes/weather");
app.set("view engine", "ejs");
//now use middleware for routes
app.use('/', weatherRoute);

app.listen(PORT, () => console.log(`Listning to the port ${PORT}`));