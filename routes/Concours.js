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


// 콩쿨 게시판 글 목록 조회
router.get('/posts/get', (req, res) => {
  db.query(`
  SELECT * FROM concours;
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


// 사진 파일 저장 미들웨어
const upload = multer({
  storage : multer.diskStorage({
    destination(req, file, done) { 
        done(null, 'build/images/upload_concours/')
    }, 
    filename(req, file, done) {
        done(null, `${currentDate}`+"_"+`${file.originalname}`);
    }
  })
})

// 콩쿨 게시판 글쓰기
router.post('/post', upload.array('img'), (req, res) => {

  const {userAccount, title, concoursPeriodFrom, concoursPeriodUntil, 
  acceptPeriodFrom, acceptPeriodUntil, location, concoursPlace, superViser, inquiry, webPage} = req.query;

  const files = req.files;
  const imageNames = [];
  files.map((item, index)=>{
    const imageCompleteName = `${currentDate}_${item.originalname}`
    imageNames.push(imageCompleteName);
  })

  db.query(`
    INSERT IGNORE INTO concours (userAccount, title, concoursPeriodFrom, concoursPeriodUntil, 
    acceptPeriodFrom, acceptPeriodUntil, location, concoursPlace, superViser, inquiry, webPage,
    imageName1, imageName2, imageName3, imageName4, imageName5) VALUES 
    ('${userAccount}', '${title}', '${concoursPeriodFrom}', '${concoursPeriodUntil}', '${acceptPeriodFrom}', '${acceptPeriodUntil}',
    '${location}', '${concoursPlace}', '${superViser}', '${inquiry}', '${webPage}',
    '${imageNames[0]}', '${imageNames[1]}', '${imageNames[2]}', '${imageNames[3]}', '${imageNames[4]}');
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

module.exports = router;