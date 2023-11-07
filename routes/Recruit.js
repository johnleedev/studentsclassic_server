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

// 구인 게시판 글 목록 조회
router.get('/get', (req, res) => {
  db.query(`
  SELECT * FROM recruit;
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


// 구인 게시판 글쓰기
router.post('/post', (req, res) => {

  const {userAccount, title, content, recruitDate, recruitTime, location, 
    recruitPlace, inquiry, company, owner} = req.body;
 
  db.query(`
    INSERT IGNORE INTO recruit (userAccount, title, content, recruitDate, recruitTime, location, 
      recruitPlace, inquiry, company, owner) VALUES 
    ('${userAccount}', '${title}', '${content}', '${recruitDate}', '${recruitTime}', '${location}', 
    '${recruitPlace}', '${inquiry}', '${company}', '${owner}');
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