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
    const userURL = url.includes('kakao') ? 'kakao' : 'naver';
    const date = new Date();

    // refreshToken 만들기
    const refreshToken = jwt.sign({ type: 'JWT', USER_ID: userID }, SECRET_KEY, {
      expiresIn: '30d',
      issuer: 'studentsclassic'
    });

    // 회원인지 파악하기
    db.query(`SELECT * FROM user WHERE userAccount = '${userEmail}' and userName = '${userName}';
    `, function(error, result){
      if (error) {throw error}
      if (result.length === 0) {  
        db.query(
          `INSERT IGNORE INTO accesstoken (userID, token, date) VALUES ('${userID}', '${AccessToken}', '${date}')`
        );
        const userData = {}
        userData.email = userEmail;
        userData.name = userName;
        userData.userURL = userURL;
        userData.refreshToken = refreshToken;
        userData.isUser = false;
        res.json(userData);
        res.end();
      } else {
        var json = JSON.stringify(result[0]);
        const userData = JSON.parse(json);
        userData.refreshToken = refreshToken;
        userData.isUser = true;

        if ( userData.userURL === userURL ) {
          res.json(userData);
          res.end();
        } else {
          db.query(
            `INSERT IGNORE INTO accesstoken (userID, token, date) VALUES ('${userID}', '${AccessToken}', '${date}')`
          );
          db.query(
            `UPDATE user SET userURL = '${userURL}' WHERE userAccount = '${userData.userAccount}'`
          );
          userData.userURL = userURL
          res.json(userData);
          res.end();
        }
    }})
  } catch (error) {
    res.status(500).json({ error: '카카오 & 네이버 로그인 에러' });
  }
});

// 애플 로그인
router.post('/loginsocial/apple', async (req, res) => {
  
  const { userInfo } = req.body;
  const { AccessToken } = req.body;
  const { userFullName } = req.body;

  const userEmail = userInfo.email;
  const userID = userInfo.c_hash;
  const familyName = userFullName.familyName;
  const givenName = userFullName.givenName;
  
  try {
    const userName = `${familyName}${givenName}`;
    const SECRET_KEY = secretKey.key;
    const userURL = 'apple';
    const date = new Date();

    // refreshToken 만들기
    const refreshToken = jwt.sign({ type: 'JWT', USER_ID: userID }, SECRET_KEY, {
      expiresIn: '30d',
      issuer: 'studentsclassic'
    });

    // 회원인지 파악하기
    db.query(`SELECT * FROM user WHERE userAccount = '${userEmail}';
    `, function(error, result){
      if (error) {throw error}
      if (result.length === 0) {  
        db.query(
          `INSERT IGNORE INTO accesstoken (userID, token, date) VALUES ('${userID}', '${AccessToken}', '${date}')`
        );
        const userData = {}
        userData.email = userEmail;
        userData.name = userName;
        userData.userURL = userURL;
        userData.refreshToken = refreshToken;
        userData.isUser = false;
        res.json(userData);
        res.end();

      } else {

        var json = JSON.stringify(result[0]);
        const userData = JSON.parse(json);
        userData.refreshToken = refreshToken;
        userData.isUser = true;

        if ( userData.userURL === userURL ) {
          res.json(userData);
          res.end();
        } else {
          db.query(
            `INSERT IGNORE INTO accesstoken (userID, token, date) VALUES ('${userID}', '${AccessToken}', '${date}')`
          );
          db.query(
            `UPDATE user SET userURL = '${userURL}' WHERE userAccount = '${userData.userAccount}'`
          );
          userData.userURL = userURL
          res.json(userData);
          res.end();
        }
    }})
  } catch (error) {
    res.status(500).json({ error: '애플 로그인 에러' });
  }
});


// 구글 로그인
router.post('/loginsocial/google', async (req, res) => {

  const { user } = req.body;
  const { AccessToken } = req.body;

  try {
    const userEmail = user.email;
    const userID = user.uid;
    const userURL = 'google';
    const SECRET_KEY = secretKey.key;
    const date = new Date();

    // refreshToken 만들기
    const refreshToken = jwt.sign({ type: 'JWT', USER_ID: userID }, SECRET_KEY, {
      expiresIn: '30d',
      issuer: 'studentsclassic'
    });

    // 회원인지 파악하기
    db.query(`SELECT * FROM user WHERE userAccount = '${userEmail}';
    `, function(error, result){
      if (error) {throw error}
      if (result.length === 0) {  
        db.query(
          `INSERT IGNORE INTO accesstoken (userID, token, date) VALUES ('${userID}', '${AccessToken}', '${date}')`
        );
        const userData = {}
        userData.email = userEmail;
        userData.userURL = userURL;
        userData.refreshToken = refreshToken;
        userData.isUser = false;
        res.json(userData);
        res.end();
      } else {
        var json = JSON.stringify(result[0]);
        const userData = JSON.parse(json);
        userData.refreshToken = refreshToken;
        userData.isUser = true;

        if ( userData.userURL === userURL ) {
          res.json(userData);
          res.end();
        } else {
          db.query(
            `INSERT IGNORE INTO accesstoken (userID, token, date) VALUES ('${userID}', '${AccessToken}', '${date}')`
          );
          db.query(
            `UPDATE user SET userURL = '${userURL}' WHERE userAccount = '${userData.userAccount}'`
          );
          userData.userURL = userURL
          res.json(userData);
          res.end();
        }
    }})
  } catch (error) {
    res.status(500).json({ error: '구글 로그인 에러' });
  }
});



// 토큰 검증하기
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
  const { userAccount, userName, userSchool, userSchNum, userPart, userURL } = req.body;
  db.query(`
  INSERT IGNORE INTO user (userAccount, userName, userSchool, userSchNum, userPart, userURL) VALUES 
  ('${userAccount}', '${userName}', '${userSchool}', '${userSchNum}', '${userPart}', '${userURL}');
  `,function(error, result){
  if (error) {throw error}
  if (result.affectedRows > 0) {  
    res.send(userAccount);
    res.end();
  } else {
    res.send("");  
    res.end();
  }})
});


router.post('/deleteaccount', function(req, res, next){
  const { refreshToken, userName, userSchool, userSchNum, userPart } = req.body;

  // 토큰 검증
  const token = req.body.refreshToken;
  const copy = jwt.decode(token);
  const userID = copy.USER_ID;
    
  // 회원 정보 삭제
  db.query(`
  DELETE FROM user WHERE userName = '${userName}' and userSchool = '${userSchool}' and userSchNum = '${userSchNum}' and userPart = '${userPart}'
  `,function(error, result){
  if (error) {throw error}
  if (result.affectedRows > 0) {  
    db.query(`DELETE FROM accesstoken WHERE userID = '${userID}'`);
    res.send(true);
    res.end();
  } else {
    res.send("");  
    res.end();
  }})
});

router.post('/loginadmin', function(req, res){
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'gksksla6985!') {
    res.send(true);
    res.end();
  } else {
    res.send(false);
    res.end();
  }

});

module.exports = router;