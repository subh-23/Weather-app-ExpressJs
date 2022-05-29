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
    const url_api = `${process.env.API_ID}=${city}&appid=${process.env.API_KEY}`;
    try {
       const news= await fetch(url_api)
                if (news.message === 'city not found') {
                    res.render('index', {
                        city: news.message,
                        des: null,
                        icon: null,
                        temp: null
                    })
                } else {
                    const city = news.name;
                    const des = news.weather[0].description;
                    const icon = news.weather[0].icon;
                    const temp = news.main.temp;
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
