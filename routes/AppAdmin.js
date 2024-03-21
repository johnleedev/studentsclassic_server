const express = require('express');
const router = express.Router()
router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { db } = require('../db');


// 회원 정보 가져오기
router.get('/userlist', (req, res) => {
  db.query(`
  SELECT * FROM user;
  `, function(error, result, fields) {
    if (error) throw error;
    if (result.length > 0) {
      res.send(result);
      res.end();
    } else {              
      res.send(error);
      res.end();
    }            
  });
});

// 앱 접속 정보 가져오기
router.get('/appusecount', (req, res) => {
  db.query(`
  SELECT * FROM appusecount;
  `, function(error, result, fields) {
    if (error) throw error;
    if (result.length > 0) {
      res.send(result);
      res.end();
    } else {              
      res.send(error);
      res.end();
    }            
  });
});

// 이벤트 현황 가져오기
router.get('/event', (req, res) => {
  db.query(`
  SELECT * FROM event;
  `, function(error, result, fields) {
    if (error) throw error;
    if (result.length > 0) {
      res.send(result);
      res.end();
    } else {              
      res.send(error);
      res.end();
    }            
  });
});




module.exports = router;