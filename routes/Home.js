const express = require('express');
const router = express.Router()
var cors = require('cors');
router.use(cors());

router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { db } = require('../db');
const multer  = require('multer')


// 광고 데이터 가져오기 ////
router.get('/getadvertise', (req, res) => {
db.query(`
select * from advertise;
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


// Schoollist 데이터 가져오기 ////
router.get('/schoollist', (req, res) => {
db.query(`
select * from schoollist;
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

// 특정 학교 유저 정보 가져오기 ////
router.get('/getusers/:school', (req, res) => {
const userSchool = req.params.school;
db.query(`
select * from user WHERE userSchool = '${userSchool}';
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


// News 데이터 가져오기 ////
router.get('/getnews', (req, res) => {
db.query(`
select * from news;
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


// News 데이터 입력오기 ////
router.post('/inputnews', (req, res) => {

  const { newsTitle, newsDate, newsAuthor, newsLink, newsImageUrl, newsMessage } = req.body;
 
  db.query(`
  INSERT IGNORE INTO news (title, date, author, link, image, content) VALUES 
      ('${newsTitle}', '${newsDate}', '${newsAuthor}', '${newsLink}', '${newsImageUrl}', '${newsMessage}');
  `, function(error, result){
  if (error) {throw error}
  if (result.affectedRows > 0) {
      res.send(true);
      res.end();
  } else {
      res.send(error);  
      res.end();
  }})
});

// 제안 목록 가져오기 
router.get('/getsuggestions', (req, res) => {
db.query(`
select * from suggestions;
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


// 제안 입력하기
router.post('/suggestion', (req, res) => {
const { content, date, userAccount, userName, userSchool, userSchNum, userPart } = req.body;
db.query(`
INSERT IGNORE INTO suggestions (content, userAccount, userName, userSchool, userSchNum, userPart, date) VALUES 
    ('${content}', '${userAccount}', '${userName}', '${userSchool}', '${userSchNum}', '${userPart}', '${date}');
`, function(error, result){
if (error) {throw error}
if (result.affectedRows > 0) {
    res.send(true);
    res.end();
} else {
    res.send(error);  
    res.end();
}})
});

// 제안 삭제하기
router.post('/deletesuggestion', (req, res) => {
const { postID, userAccount } = req.body;
db.query(`
DELETE FROM suggestions WHERE id = '${postID}' and userAccount = '${userAccount}';
`, function(error, result){
if (error) {throw error}
if (result.affectedRows > 0) {  
    res.send(true);
    res.end();
} else {
    res.send(error);  
    res.end();
}})
});


// 추가 프로필 데이터 가져오기 ////
router.get('/getprofile/:user', (req, res) => {
var userAccount = req.params.user;
db.query(`
select * from user WHERE userAccount = '${userAccount}';
`, function(error, result){
if (error) {throw error}
if (result.length > 0) {
    const carrerInputsCopy = JSON.parse(result[0].carrerInputs);
    const videoLinksCopy = JSON.parse(result[0].videoLinks);
    const imageNamesCopy = JSON.parse(result[0].imageNames);
    const data = {
    ...result[0],
    carrerInputs : carrerInputsCopy,
    videoLinks : videoLinksCopy,
    imageNames : imageNamesCopy
    }
    res.send(data);
    res.end();
} else {
    res.send(error);  
    res.end();
}})
});


// 날짜 생성하기
let today = new Date();
let year = today.getFullYear();
let monthcopy = today.getMonth() + 1 ;
let month = monthcopy < 10 ? `0${monthcopy}` : `${monthcopy}`;
let daycopy = today.getDay();
let day = daycopy < 10 ? `0${daycopy}` : `${daycopy}`;
let currentDate = `${year}${month}${day}`;


// 사진 파일 저장 미들웨어
const upload = multer({
storage : multer.diskStorage({
    destination(req, file, done) { 
        done(null, 'build/images/upload_profile/')
    }, 
    filename(req, file, done) {
        done(null, `${currentDate}`+"_"+`${file.originalname}`);
    }
})
})

// 프로필 정보 업데이트 공통 함수
const updateProfile = (req, res, hasPhoto) => {
const { userAccount, userName, contactWhich, contactNum, carrerInputs, videoLinks, imageNamesOrigin } = req[hasPhoto ? 'query' : 'body'];

const carrerInputsCopy = JSON.stringify(carrerInputs);
const videoLinksCopy = JSON.stringify(videoLinks);

const imageNames = hasPhoto ? req.files.map(item => `${currentDate}_${item.originalname}`) : imageNamesOrigin;
const imageNamesCopy = JSON.stringify(imageNames);

db.query(`
    UPDATE user SET 
    contactWhich = '${contactWhich}', 
    contactNum = '${contactNum}', 
    carrerInputs = '${carrerInputsCopy}', 
    videoLinks = '${videoLinksCopy}', 
    imageNames = '${imageNamesCopy}'
    WHERE userAccount = '${userAccount}' AND userName = '${userName}';
`, (error, result) => {
    if (error) {
    throw error;
    }
    res.send(result.affectedRows > 0);
    res.end();
});
};

// 프로필 정보 추가 입력하기 (사진 포함)
router.post('/profilerevisewithphoto', upload.array('img'), (req, res) => {
updateProfile(req, res, true);
});

// 프로필 정보 추가 입력하기 (사진 미포함)
router.post('/profilerevisewithoutphoto', (req, res) => {
updateProfile(req, res, false);
});

module.exports = router;
