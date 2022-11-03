const express = require('express')
const app = express()

app.listen(8080, () => {
  console.log(require("ip").address());
});

app.get('/', (req, res)=> {
    res.json({ "pet": "dog"});
    console.log('GETリクエストを受け取りました')
    res.end();
})
