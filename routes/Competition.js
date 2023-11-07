const express = require('express');
const router = express.Router()
router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { db } = require('../db');
const multer  = require('multer')

let today = new Date();
let year = today.getFullYear();
let monthcopy = today.getMonth() + 1 ;
let month = monthcopy < 10 ? `0${monthcopy}` : `${monthcopy}`;
let daycopy = today.getDay();
let day = daycopy < 10 ? `0${daycopy}` : `${daycopy}`;
let currentDate = `${year}${month}${day}`;

// 글 목록 가져오기
router.get('/getlast', (req, res) => {
  db.query(`
  SELECT * FROM competition WHERE state = 'last';
  `, function(error, result) {
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

router.get('/getcurrent', (req, res) => {
  db.query(`
  SELECT * FROM competition WHERE state = 'current';
  `, function(error, result) {
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

// 참가자 명단 가져오기
router.get('/getentry/:id', (req, res) => {

  var id = req.params.id;
  db.query(`
  SELECT * FROM competitionentry WHERE comptNum = '${id}';
  `, function(error, result) {
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

// 사진 파일 저장 미들웨어
const upload = multer({
  storage : multer.diskStorage({
    destination(req, file, done) { 
        done(null, 'build/images/upload_comptProfile/')
    }, 
    filename(req, file, done) {
        done(null, `${currentDate}`+"_"+`${file.originalname}`);
    }
  })
})

// 콩쿨 게시판 글쓰기
router.post('/post', upload.array('img'), (req, res) => {
  
  const {comptNum, userAccount, userName, userSchool, userSchNum, userPart,
    songTitle, songWriter, songUri} = req.query;

  const files = req.files;
  const imageNames = [];
  files.map((item, index)=>{
    const imageCompleteName = `${currentDate}_${item.originalname}`
    imageNames.push(imageCompleteName);
  })

  db.query(`
    INSERT IGNORE INTO competitionentry (comptNum, userAccount, userName, userSchool, userSchNum, userPart, songUri, title, profileImage) VALUES 
    ('${comptNum}', '${userAccount}', '${userName}', '${userSchool}', '${userSchNum}', '${userPart}',
    '${songUri}', '${songTitle}-${songWriter}', '${imageNames[0]}');
    `, function(error, result){
      if (error) {throw error}
      if (result.affectedRows > 0) {  
        res.send(true);
        res.end();
      } else {
        res.send(false);  
        res.end();
      }
    }
  )

});

// 심사평 가져오기
router.get('/getevaluate/:id', (req, res) => {

  var id = req.params.id;
  db.query(`
  SELECT * FROM evaluate WHERE post_id = '${id}';
  `, function(error, result) {
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

// 심사평 글쓰기
router.post('/evaluate', (req, res) => {
  
  const {post_id, userAccount, scoreSinging, scoreExpress, scoreLyrics, evaluateText} = req.body;

  // 심사평 썻는지 파악하기
  db.query(`SELECT * FROM evaluate WHERE post_id = '${post_id}' and userAccount = '${userAccount}';
  `, function(error, result){
    if (error) {throw error}
    if (result.length === 0) {  
      db.query(`
        INSERT IGNORE INTO evaluate (post_id, userAccount, scoreSinging, scoreExpress, scoreLyrics, evaluateText) VALUES 
        ('${post_id}', '${userAccount}', '${scoreSinging}', '${scoreExpress}', '${scoreLyrics}', '${evaluateText}');
        `, function(error, result){
          if (error) {throw error}
          if (result.affectedRows > 0) {  
            res.send(true);
            res.end();
          } else {
            res.send(false);  
            res.end();
          }
        }
      )
    } else {
      res.send('이미있음');
      res.end();
  }})
  
  
});


module.exports = router;
