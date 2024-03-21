const express = require('express');
const router = express.Router()
router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { db } = require('../db');
const multer  = require('multer')
var fs = require("fs");


// 추가 프로필 데이터 가져오기 ////
router.get('/getprofile/:user', (req, res) => {
  var userAccount = req.params.user;
  db.query(`
  select userAccount, userName, userSchool, userSchNum, userPart from user WHERE userAccount = '${userAccount}';
  `, function(error, result){
  if (error) {throw error}
  if (result.length > 0) {
      res.send(result);
      res.end();
  } else {
      res.send(error);  
      res.end();
  }})
});



// 프로필 정보 변경
router.post('/changeprofile', (req, res) => {
    
  const { userAccount, userName, userSchool, userSchNum, userPart } = req.body;
  db.query(`
  UPDATE user SET 
  userName = '${userName}', 
  userSchool = '${userSchool}', 
  userSchNum = '${userSchNum}', 
  userPart = '${userPart}' 
  WHERE userAccount = '${userAccount}'
  `,function(error, result){
  if (error) {throw error}
  if (result.affectedRows > 0) {
    res.send(true);
    res.end();
  } else {
    res.send(false);
    res.end();
  }})
});
  


// 신고하기
router.post('/reportposts', (req, res) => {
    
  const { reportPart, content, userAccount, date } = req.body;
  db.query(`
  INSERT IGNORE INTO report (reportPart, content, userAccount, date) VALUES
   ('${reportPart}', '${content}', '${userAccount}', '${date}');
  `,function(error, result){
  if (error) {throw error}
  if (result.affectedRows > 0) {
    res.send(true);
    res.end();
  } else {
    res.send(false);
    res.end();
  }})
});
  


module.exports = router;
