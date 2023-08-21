const express = require('express');
const router = express.Router()
var cors = require('cors');
router.use(cors());

router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { db } = require('../db');

const axios = require('axios');
var jwt = require("jsonwebtoken");
const secretKey = require('../secretKey');


// 카카오 & 네이버 로그인 로직
router.post('/login/:url', async (req, res) => {
  var url = req.params.url;

  try {
    const { AccessToken } = req.body;
    const apiURL = url.includes('kakao') ?
      'https://kapi.kakao.com/v2/user/me' :
      'https://openapi.naver.com/v1/nid/me';

    const result = await axios({
      method: 'GET', url: apiURL,
      headers: { Authorization: `Bearer ${AccessToken}` }
    });

    const userEmail = url.includes('kakao') ? result.data.kakao_account.email : result.data.response.email;
    const userName = url.includes('kakao') ? result.data.kakao_account.name : result.data.response.name;
    const userID = url.includes('kakao') ? result.data.id : result.data.response.id;
    const SECRET_KEY = secretKey.key;

    // refreshToken 만들기
    const refreshToken = jwt.sign({ type: 'JWT', USER_ID: userID }, SECRET_KEY, {
      expiresIn: '1d',
      issuer: 'studentsclassic'
    });

    // 회원인지 파악하기
    db.query(`SELECT * FROM user WHERE userAccount = '${userEmail}' and userName = '${userName}';
    `, function(error, result){
      if (error) {throw error}
      if (result.length === 0) {  
        const date = new Date();
        db.query(
          `INSERT IGNORE INTO accesstoken (userID, token, date) VALUES ('${userID}', '${AccessToken}', '${date}')`
        );
        const userData = {}
        userData.email = userEmail;
        userData.name = userName;
        userData.refreshToken = refreshToken;
        userData.isUser = false;
        res.json(userData);
        res.end();
      } else {
        var json = JSON.stringify(result[0]);
        const userData = JSON.parse(json);
        userData.refreshToken = refreshToken;
        userData.isUser = true;
        res.json(userData);
        res.end();
    }})
  

  } catch (error) {
    res.status(500).json({ error: '카카오 & 네이버 로그인 에러' });
  }
});


router.post('/verifytoken', (req,res)=>{
  const token = req.body.verifyToken;
  const copy = jwt.decode(token);
  const userID = copy.USER_ID;
  const SECRET_KEY = secretKey.key;
  const userData = {}

  jwt.verify(token, SECRET_KEY, (error, decoded)=>{
    // torken기한이 만료되었을때
    if(error) {
      if(error.name === 'TokenExpiredError'){
        // user찾아보기
        db.query(`SELECT userId FROM accesstoken WHERE userId = '${userID}';
        `,function(error, result){
          if (error) {throw error}
          if (result.length === 0) {  
            userData.isUser = false;
            res.send(userData);
            res.end();
          } else {
            // 다시 발급해주기
            var refreshToken = jwt.sign({type: 'JWT', USER_ID : userID}, SECRET_KEY, {expiresIn: '1d', issuer: 'studentsclassic'});
            userData.refreshToken = refreshToken;
            userData.isUser = true;
            res.json(userData);
            res.end();
        }})
      };  
    } else if (decoded.USER_ID === userID) {
     // torken이 유효할 때
      res.send('success');
      res.end();
    }
  })
 
}) 


// logister
router.post('/logisterdo', function(req, res, next){
  const { userAccount, userName, userSchool, userSchNum, userPart } = req.body;
  db.query(`
  INSERT IGNORE INTO user (userAccount, userName, userSchool, userSchNum, userPart) VALUES 
  ('${userAccount}', '${userName}', '${userSchool}', '${userSchNum}', '${userPart}');
  `,function(error, result){
  if (error) {throw error}
  if (result.affectedRows > 0) {  
    res.send(userName);
    res.end();
  } else {
    res.send("");  
    res.end();
  }})
});


// router.post('/deleteaccount', function(req, res, next){
//   const { userAccount, userName, userSchool, userSchNum, userPart } = req.body;
//   db.query(`
//   INSERT IGNORE INTO user (userAccount, userName, userSchool, userSchNum, userPart) VALUES 
//   ('${userAccount}', '${userName}', '${userSchool}', '${userSchNum}', '${userPart}');
//   `,function(error, result){
//   if (error) {throw error}
//   if (result.affectedRows > 0) {  
//     res.send(userName);
//     res.end();
//   } else {
//     res.send("");  
//     res.end();
//   }})
// });



module.exports = router;