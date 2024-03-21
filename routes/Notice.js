const express = require('express');
const router = express.Router()

router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { db } = require('../db');

const axios = require('axios');
var jwt = require("jsonwebtoken");
const secretKey = require('../secretKey');

// 공지사항 데이터 가져오기 및 입력
router.get('/noticelist', (req, res)=>{

  db.query(`SELECT * FROM notice;
  `,function(error, result){
    if (error) {throw error}
    if (result.length > 0) {
      res.send(result);
      res.end();
    } else {
      res.send(error);  
      res.end();
  }})
});
  



module.exports = router;