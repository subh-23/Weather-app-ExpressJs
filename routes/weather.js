const express = require('express');
const route = express.Router();
const fetch = require("node-fetch");

route.get('/', (req, res) => {
    res.render('index', {
        city: null,
        temp: null,
        icon: null,
        des: null
    });
})
route.post('/', async (req, res) => {
    const city = req.body.city;
    const url_api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=f5ebf10c947c21684408648cda9a5363`;
    try {
        await fetch(url_api)
            .then(res => res.json())
            .then(data => {
                if (data.message === 'city not found') {
                    res.render('index', {
                        city: data.message,
                        des: null,
                        icon: null,
                        temp: null
                    })
                } else {
                    const city = data.name;
                    const des = data.weather[0].description;
                    const icon = data.weather[0].icon;
                    const temp = data.main.temp;
                    res.render('index', {
                        city, des, icon, temp
                    });
                }
            }
            );
    } catch (err) {
        res.render('index', {
            city: "somthing wrong",
            des: null,
            icon: null,
            temp: null
        })
    }
}
)

module.exports = route;