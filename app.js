const express = require('express');
const path = require('path');
const app = express();
const { db } = require('./db');

var bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
var cors = require('cors');
var parseurl = require('parseurl');
const multer  = require('multer')

// 라우터들
var loginRouter = require('./routes/login')
var BoardRouter = require('./routes/Board')
var CompetitionRouter = require('./routes/Competition')
var NoticeRouter = require('./routes/Notice')
var Notification = require('./routes/Notification')
var Concours = require('./routes/Concours')
var Concert = require('./routes/Concert')
var Recruit = require('./routes/Recruit')
app.use('/login', loginRouter);
app.use('/board', BoardRouter);
app.use('/competition', CompetitionRouter);
app.use('/notice', NoticeRouter);
app.use('/notification', Notification);
app.use('/concours', Concours);
app.use('/concert', Concert);
app.use('/recruit', Recruit);


app.use(express.static('build'));
app.use(express.urlencoded({extended: true})) 
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(helmet());
app.use(cors());

app.listen(8000, ()=>{
  console.log('server is running')
});


// 앱 상태 가져오기 ////
app.get('/getappstate', (req, res) => {
  db.query(`
  select * from appstate;
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

// 광고 데이터 가져오기 ////
app.get('/getadvertise', (req, res) => {
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
app.get('/schoollist', (req, res) => {
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
app.get('/getusers/:school', (req, res) => {
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
app.get('/getnews', (req, res) => {
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

// 제안 목록 가져오기 
app.get('/getsuggestions', (req, res) => {
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
app.post('/suggestion', (req, res) => {
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
app.post('/deletesuggestion', (req, res) => {
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
app.get('/getprofile/:user', (req, res) => {
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
app.post('/profilerevisewithphoto', upload.array('img'), (req, res) => {
  updateProfile(req, res, true);
});

// 프로필 정보 추가 입력하기 (사진 미포함)
app.post('/profilerevisewithoutphoto', (req, res) => {
  updateProfile(req, res, false);
});


// 리액트 연결하기 ----------------------------------------------------------------- //

app.use(express.static(path.join(__dirname, '/build')));
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/build/index.html'));
});
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, '/build/index.html'));
});
app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

