const express = require('express');
const router = express.Router()
var cors = require('cors');
router.use(cors());
router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { db } = require('../db');


// 노래 ----------------------------------------------------------------------------------------

// 곡 리스트 보내기
router.get('/getsongdataall/:sort/:nation/:alphabet', async (req, res)=>{

  var sort = req.params.sort;
  var nation = req.params.nation;
  var alphabet = req.params.alphabet;

  const querySong = alphabet === '전체' ? `SELECT id, songName, author FROM data${sort}${nation};`
                : `SELECT id, songName, author FROM data${sort}${nation} WHERE songName LIKE '${alphabet}%';`

  const queryAria = alphabet === '전체' ? `SELECT id, songName, operaName, author FROM data${sort}${nation};`
                : `SELECT id, songName, operaName, author FROM data${sort}${nation} WHERE songName LIKE '${alphabet}%';`
  
  db.query(sort === 'Song' ? querySong : queryAria, function(error, result, fields) {
    if (error) throw error;
    if (result.length > 0) {
      res.send(result);
      res.end();
    } else {              
      res.send(false);
      res.end();
    }
  })

});


// 특정 곡 찾기
router.get('/getsongdata/:sort/:nation/:id', async (req, res)=>{

  var sort = req.params.sort;
  var nation = req.params.nation;
  var songId = req.params.id;

  db.query(`
    SELECT * FROM data${sort}${nation} WHERE id = '${songId}';
    `, function(error, result, fields) {
    if (error) throw error;
    if (result.length > 0) {
      res.send(result);
      res.end();
    } else {              
      res.send(false);
      res.end();
    }
  })
 
});

// 곡 정보 저장
router.post('/savesong', async (req, res)=>{
  const { sort, nation, songName, operaName, author, lyrics, trans } = req.body;

  const escapeQuotes = (str) => str.replaceAll('è', '\è').replaceAll("'", "\\\'").replaceAll('"', '\\\"').replaceAll('\\n', '\\\\n');
  const songNameCopy = escapeQuotes(songName);
  const operaNameCopy = escapeQuotes(operaName);
  const authorCopy = escapeQuotes(author);
  const lyricsCopy = escapeQuotes(lyrics);
  const transCopy = escapeQuotes(trans);

  const songQuery = `INSERT IGNORE INTO dataSong${nation} (songName, author, lyrics, trans) VALUES 
                      ('${songNameCopy}', '${authorCopy}', '${lyricsCopy}', '${transCopy}' );`
  const ariaQuery = `INSERT IGNORE INTO dataAria${nation} (songName, operaName, author, lyrics, trans) VALUES 
                    ('${songNameCopy}', '${operaNameCopy}', '${authorCopy}', '${lyricsCopy}', '${transCopy}');`
  
  db.query(`SELECT songName FROM data${sort}${nation} WHERE songName = '${songNameCopy}' AND author = '${authorCopy}';
  `,function(error, result){
    if (error) {throw error}
    if (result.length === 0) {  
      db.query(sort === "Song" ? songQuery : ariaQuery, function(error, result){
      if (error) {throw error}
      if (result.affectedRows > 0) {  
        res.send(true);
        res.end();
      } else {
        res.send(false);
        res.end();
      }})
    } else {
      res.send(false);
      res.end();      
  }})
 
});

// 단어 ----------------------------------------------------------------------------------------

// 단어 모든 리스트 보내기
router.get('/getworddataadmin/:nation', async (req, res)=>{
  var nation = req.params.nation;
  db.query(`
    SELECT * FROM dataWord${nation};
    `, function(error, result, fields) {
    if (error) throw error;
    if (result.length > 0) {
      res.send(result);
      res.end();
    } else {              
      res.send(false);
      res.end();
    }
  })
});

// 단어 수정하기
router.post('/wordrevise', async (req, res)=>{
  
  const { nation, wordID, meaning } = req.body;

  db.query(`
    UPDATE dataWord${nation} SET meaning = '${meaning}' WHERE id = '${wordID}';
    `, function(error, result, fields) {
    if (error) throw error;
    if (result.affectedRows > 0) {
      res.send(true);
      res.end();
    } else {
      res.send(false); 
      res.end();
    }
  })
});

// 단어 삭제하기
router.post('/worddelete', async (req, res)=>{
  
  const { nation, wordID } = req.body;

  db.query(`
    DELETE FROM dataWord${nation} WHERE id = '${wordID}';
    `, function(error, result, fields) {
    if (error) throw error;
    if (result.affectedRows > 0) {
      res.send(true);
      res.end();
    } else {
      res.send(false); 
      res.end();
    }
  })
});


// 단어 알파벳별 리스트 보내기
router.get('/getworddataall/:nation/:alphabet', async (req, res)=>{
  
  var nation = req.params.nation;
  var alphabet = req.params.alphabet;

  db.query(`
    SELECT word FROM dataWord${nation} WHERE word LIKE '${alphabet}%';
    `, function(error, result, fields) {
    if (error) throw error;
    if (result.length > 0) {
      res.send(result);
      res.end();
    } else {              
      res.send(false);
      res.end();
    }
  })
});

// 특정 단어 찾기
router.get('/getworddata/:nation/:word', async (req, res)=>{

  var nation = req.params.nation;
  var word = req.params.word;

  db.query(`
    SELECT * FROM dataWord${nation} WHERE word = '${word}';
    `, function(error, result, fields) {
    if (error) throw error;
    if (result.length > 0) {
      res.send(result);
      res.end();
    } else {              
      res.send(false);
      res.end();
    }
  })
 
});


// 단어 신고하기
router.get('/getworddata/:nation/:word', async (req, res)=>{

  var nation = req.params.nation;
  var word = req.params.word;

  db.query(`
    SELECT * FROM dataWord${nation} WHERE word = '${word}';
    `, function(error, result, fields) {
    if (error) throw error;
    if (result.length > 0) {
      res.send(result);
      res.end();
    } else {              
      res.send(false);
      res.end();
    }
  })
 
});

// 요청 ----------------------------------------------------------------------------------------

// 요청 리스트 보내기
router.get('/getrequestall/:select', async (req, res)=>{
  
  var select = req.params.select;
  
  db.query(`
    SELECT * FROM data${select}Request;
    `, function(error, result, fields) {
    if (error) throw error;
    if (result.length > 0) {
      res.send(result);
      res.end();
    } else {              
      res.send(false);
      res.end();
    }
  })
});

// 요청 등록
router.post('/request', async (req, res)=>{

  const { select, sort, nation, songName, author, word, date, response, userAccount, userName } = req.body;

  const escapeQuotes = (str) => str.replaceAll('è', '\è').replaceAll("'", "\\\'").replaceAll('"', '\\\"').replaceAll('\\n', '\\\\n');

  const songNameCopy = songName ? escapeQuotes(songName) : '';
  const authorCopy = author ? escapeQuotes(author) : '';
  const wordCopy = word ? escapeQuotes(word) : '';

  if (select === 'Song') {
    db.query(`SELECT songName FROM dataSongRequest WHERE songName = '${songNameCopy}';
    `,function(error, result){
      if (error) {throw error}
      if (result.length === 0) {  
        db.query(`
        INSERT IGNORE INTO dataSongRequest (songName, author, sort, nation, date, response, userAccount, userName) VALUES 
        ('${songNameCopy}', '${authorCopy}', '${sort}', '${nation}', '${date}', '${response}', '${userAccount}', '${userName}');
        `,function(error, result){
        if (error) {throw error}
        if (result.affectedRows > 0) {  
          res.send(true);
          res.end();
        } else {
          res.send('오류로 인해 입력되지 않았습니다. 다시 시도해주세요');
          res.end();
        }})
      } else {
        res.send('이미 요청된 곡입니다. 등록될때까지 기다려주시기 바랍니다.');
        res.end();      
    }})
  }
  if (select === 'Word') {
    db.query(`SELECT word FROM dataWordRequest WHERE word = '${wordCopy}';
    `,function(error, result){
      if (error) {throw error}
      if (result.length === 0) {  
        db.query(`
        INSERT IGNORE INTO dataWordRequest (word, nation, date, response) VALUES 
        ('${wordCopy}', '${nation}', '${date}', '${response}');
        `,function(error, result){
        if (error) {throw error}
        if (result.affectedRows > 0) {  
          res.send(true);
          res.end();
        } else {
          res.send('오류로 인해 입력되지 않았습니다. 다시 시도해주세요');
          res.end();
        }})
      } else {
        res.send('이미 요청된 단어입니다. 등록될때까지 기다려주시기 바랍니다.');
        res.end();      
    }})
  }
});


// 음악 스터디 ------------------------------------------------------------------------------------------------

// 음악용어 리스트 전부 보내기
router.get('/getmusicwordall', async (req, res)=>{

  db.query(`
  SELECT * FROM musicWordsDefault;
  `
  , function(error, result) {
    if (error) throw error;
    if (result.length > 0) {
      res.send(result);
      res.end();
    } else {             
      res.send(false);
      res.end();
    }
  })

});


// 음악용어 리스트 50개씩 보내기
router.get('/getmusicword/:page', async (req, res)=>{

  var currentpage = req.params.page;

  const page = parseInt(currentpage) || 1; // 현재 페이지
  const pageSize = 50; // 페이지당 항목 수
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const results = {};

  db.query(`
  SELECT * FROM musicWords;
  `
  , function(error, result) {
    if (error) throw error;
    if (result.length > 0) {
     
      if (endIndex < result.length) {
        results.next = {
            page: page + 1,
            pageSize: pageSize
        };
      }
  
      results.items = result.slice(startIndex, endIndex);

      res.send(results);
      res.end();
    } else {             
      res.send(false);
      res.end();
    }
  })
});



// 음악용어 알파벳별 검색 리스트 보내기
router.get('/getmusicwordsearch/:alphabet', async (req, res)=>{

  var alphabet = req.params.alphabet;

  db.query(`
  SELECT * FROM musicWords
  WHERE word LIKE '%${alphabet}%'
  `
  , function(error, result) {
    if (error) throw error;
    if (result.length > 0) {
      res.send(result);
      res.end();
    } else {             
      res.send(false);
      res.end();
    }
  })
});


// 조성 리스트 전부 보내기
router.get('/getmusickeyall', async (req, res)=>{

  db.query(`
  SELECT * FROM musicKeys;
  `
  , function(error, result) {
    if (error) throw error;
    if (result.length > 0) {
      res.send(result);
      res.end();
    } else {             
      res.send(false);
      res.end();
    }
  })

});



module.exports = router;
