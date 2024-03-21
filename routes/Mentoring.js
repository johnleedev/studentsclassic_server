const express = require('express');
const router = express.Router()
var cors = require('cors');
router.use(cors());

router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { db } = require('../db');
const multer  = require('multer')
var fs = require("fs");


// 멘토링 등록 여부 상태 가져오기 //
router.get('/getmentoringregister/:userAccount', (req, res) => {
  const userAccount = req.params.userAccount
  db.query(`
  select userAccount, mentoring from user WHERE userAccount = '${userAccount}';
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

// 멘토링 신청 여부 상태 가져오기 //
router.get('/getregisterstate/:userAccount', (req, res) => {
  const userAccount = req.params.userAccount
  db.query(`
  select sort, userAccount from mentoringRegister WHERE userAccount = '${userAccount}';
  `, function(error, result){
  if (error) {throw error}
  if (result.length > 0) {
    res.send(result);
    res.end();
  } else {
    res.send(false);
    res.end();
  }})
});


// 멘토리스트 가져오기 ////
router.get('/getmentorlist', (req, res) => {
  db.query(`
  select * from mentorList;
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

// 멘티리스트 가져오기 ////
router.get('/getmenteelist', (req, res) => {
  db.query(`
  select * from menteeList;
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

// 등록하기 --------------------------------------------------------------------------------

// 사진 파일 저장 미들웨어
const upload_default = multer({
  storage : multer.diskStorage({
      destination(req, file, done) { 
        if (req.query.sort === 'mentor') {
          done(null, 'build/images/mentoring/mentor')
        } else {
          done(null, 'build/images/mentoring/mentee')
        }
      }, 
      filename(req, file, done) {
        done(null, `${file.originalname}`);
      }
  })
})

// 멘토&멘티 등록 함수 실행 (사진 포함)
router.post('/registermentoring', upload_default.array('img'), (req, res) => {
  const {sort, userAccount, userName, userSchool, userSchNum, userPart, 
        userLocation, userRegion, userCareer, 
        userYoutubeLink, userPhone, userImageProfile, userImageAuth } = req.query;

  db.query(`
  INSERT IGNORE INTO mentoringRegister (sort, userAccount, userName, userSchool, userSchNum, userPart,
    userLocation, userRegion, userCareer, userYoutubeLink, userPhone, userImageProfile, userImageAuth) VALUES 
    ('${sort}', '${userAccount}', '${userName}', '${userSchool}', '${userSchNum}', '${userPart}', 
  '${userLocation}', '${userRegion}', '${userCareer}', '${userYoutubeLink}', '${userPhone}', 
  '${userImageProfile}', '${userImageAuth}');
  `, function (error, result){
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