const express = require('express');
const router = express.Router()
var cors = require('cors');
router.use(cors());

router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { db } = require('../db');

const axios = require('axios');
var jwt = require("jsonwebtoken");
const secretKey = require('../secretKey');


router.post('/test', (req, res)=>{
  console.log(req.body);

})

// 카카오 유저 정보 요청 (email,성별,생일 등) 조회
router.post('/loginkakao', (req, res)=>{
  const { AccessToken } = req.body;
  
  axios ({
    method: 'GET',
    url: 'https://kapi.kakao.com/v2/user/me',
    headers: {
      Authorization : `Bearer ${AccessToken}`
    },
  }).then((result) => {
    //카카오에서 정보 받아 와야 함
    console.log(result);
    res.send(true);
    res.end();
  }).catch((err)=>{
    console.log('requestUserInfo_error :', err);
  })
  return;
      
});


// 네이버 로그인시, 회원정보 요청 후 userID 확인하기
router.post('/loginnaver', (req, res)=>{
  
  const { AccessToken } = req.body;
  console.log(AccessToken);
  
  // 회원정보 요청
  axios ({
    method: 'GET',
    url: 'https://openapi.naver.com/v1/nid/me',
    headers: {
      Authorization : `Bearer ${AccessToken}`
    },
  }).then((result) => {
    const naverData = result.data.response
    const userID = result.data.response.id
    const SECRET_KEY = secretKey.key;
    // refreshToken 발급
    var refreshToken = jwt.sign({type: 'JWT', USER_ID : userID}, SECRET_KEY, {expiresIn: '1d', issuer: 'studentsclassic'});
    
    // DB에 userID가 있는지 확인
    db.query(`SELECT * FROM accesstoken WHERE userID = '${userID}';
    `,function(error, result){
      if (error) {throw error}
      if (result.length === 0) {  
      // 1. 없으면
        // 1) AccessToken를 userID와 날짜와 함께 저장
        const date = new Date();
        db.query(`INSERT IGNORE INTO accesstoken (userID, token, date) VALUES ('${userID}', '${AccessToken}', '${date}');
        `,function(error, result){
          if (error) {throw error}
          if (result.affectedRows > 0) {  
            console.log('AccessToken 저장 완료');
        }})
        // 2) refresh토큰과 네이버 회원정보(userId, email, mobile, name)) 프론트로 전송 
        const userData = {}
        userData.email = naverData.email;
        userData.name = naverData.name;
        userData.refreshToken = refreshToken;
        userData.isUser = false;
        console.log('userData1', userData);
        res.json(userData);
        res.end();  
      } else {
      // 2. 있으면
        // refresh토큰 발급 & 회원정보 프론트로 전송 
        db.query(`SELECT * FROM user WHERE userAccount = '${naverData.email}';
        `,function(error, result){
          if (error) {throw error}
          var json = JSON.stringify(result[0]);
          const userData = JSON.parse(json);
          userData.refreshToken = refreshToken;
          userData.isUser = true;
          console.log('userData2', userData);
          res.json(userData);
          res.end();  
        })
    }})
  }).catch((err)=>{
    console.log('requestNaverUserInfo_error:', err);
  })

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



// 프로필편집 - 프로필 정보 가져오기
// router.post('/editprofile',(req, res)=>{
//   var originName = req.body.originName;
//   var originSchool = req.body.originSchool;
//   var originSchNum = req.body.originSchNum;
//   var name = req.body.name;
//   var school = req.body.school;
//   var part = req.body.part;
//   var schNum = req.body.

//   console.log('수정', originName, originSchool, originSchNum, name, school, part, schNum)

//   db.query(`
//   update user set userName = '${name}', school = '${school}', part = '${part}', sch_num= '${sch_num}'
//   where userName = '${originName}' and school = '${originSchool}' and sch_num = '${originSch_num}'
//   `, function(error, result){
//     if (error) {throw error}
//     if (result.affectedRows > 0) {  
//       db.query('SELECT userName, school, part, sch_num FROM user'
//       , function(error, result, fields) {
//         if (error) { return (error);
//         } else if (result.length > 0) { 
//           var json = JSON.stringify(result[0]);
//           var copy = JSON.parse(json);
//           console.log(copy)
//           res.send(copy);
//           res.end();
//         } else {
//           res.send("");
//           res.end();
//         }
//       });
//     } else {
//       res.send("")
//       res.end();
//     }})
// });



module.exports = router;