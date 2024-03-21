const express = require('express');
const router = express.Router()
var cors = require('cors');
router.use(cors());
router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { db } = require('../db');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');

process.setMaxListeners(200);

router.post('/postmeaning', async (req, res)=> {
  
  const { nation, word, wordNum } = req.body;
 
  const nationquery = (nation === 'Itary') ? 'itkodict' : 'dekodict';

  try { 
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(`https://dict.naver.com/${nationquery}/#/search?range=word&query=${word}`);
    await page.waitForTimeout(1000);
    await page.waitForSelector('div#content');
    const content = await page.content();
    const $ = cheerio.load(content);
    var resultArray = [];
    var hrefLink = '';

    $('.component_keyword .row').slice(0,5).each((index, element) => { 
      const source =  (nation === 'Itary') ? $(element).find('p:contains("한국외국어대학교")')
                                          : $(element).find('p:contains("민중서림")');
      const parentElement = source.parent();
      if (parentElement.length > 0) {
        const result = $(parentElement).find('.origin a.link').attr('href');
        resultArray.push(result);
      }
    })
    hrefLink = resultArray[0];
    
    await page.goto(`https://dict.naver.com/${nationquery}/${hrefLink}`);
    await page.waitForTimeout(1000);
    await page.waitForSelector('div#content');
    const subcontent = await page.content();
    const sub$ = cheerio.load(subcontent);

    const formattedWord = [];
    sub$('.mean_list > .mean_item.my_mean_item').each((index, element) => {
      
      const additionalMeanings = sub$(element).find('.mean_list > .mean_item.my_mean_item');
      
      if (additionalMeanings.length > 0) {
          const num = sub$(element).find('> div.mean_desc > span.num').text().trim();
          const gender = sub$(element).find('> div.mean_desc > div.cont > em.part_speech').text().trim();
          const meaning = sub$(element).find('> div.mean_desc > div.cont > span.mean').text().trim();
          const relationWord = sub$(element).find('ul.component_relation');

          const formattedEntry = {
            num: num,
            gender: gender,
            meaning: meaning,
          };

          const addMeaning = [];
          additionalMeanings.each((addIndex, addElement) => {

            const addNum = sub$(addElement).find('div.mean_desc span.num.c').text().trim();
            const addGender = sub$(addElement).find('div.mean_desc div.cont em.part_speech').text().trim();
            const addMeaningText = sub$(addElement).find('div.mean_desc div.cont span.mean').text().trim();
            
            addMeaning.push({
                addNum: addNum,
                addGender: addGender,
                addMeaning: addMeaningText,
            });
          });
  
          formattedEntry.addMeaning = addMeaning;

          if (relationWord.length > 0 ) {
            const relationWordCopy = sub$(element).find('ul.component_relation li.row span.item').text().trim();
            formattedEntry.relationWord = relationWordCopy;
          }

          formattedWord.push(formattedEntry);

      } else {

        const copy = sub$(element).find('> div.mean_desc span.num.c');
        
        if (copy.length > 0 ) {
          return
        } else {
            const num = sub$(element).find('> div.mean_desc > span.num').text().trim();
            const gender = sub$(element).find('> div.mean_desc > div.cont > em.part_speech').text().trim();
            const meaning = sub$(element).find('> div.mean_desc > div.cont > span.mean').text().trim();
            const relationWord = sub$(element).find('ul.component_relation');

            const formattedEntry = {
              num: num,
              gender: gender,
              meaning: meaning,
            };

            if (relationWord.length > 0 ) {
              const relationWordCopy = sub$(element).find('ul.component_relation li.row span.item').text().trim();
              formattedEntry.relationWord = relationWordCopy;
            }

            formattedWord.push(formattedEntry);
        }
      }
    });

    await browser.close();

    const escapeQuotes = (str) => str.replaceAll('è', '\è').replaceAll("'", "\\\'").replaceAll('"', '\\\"').replaceAll('\\n', '\\\\n');
    const wordCopy = escapeQuotes(word);
    const formattedWordCopy = JSON.stringify(formattedWord)
    const formattedWordCopy2 = escapeQuotes(formattedWordCopy);
    

    db.query(`SELECT word FROM wordData${nation} WHERE word = '${wordCopy}';
    `,function(error, result){
      if (error) {throw error}
      if (result.length === 0) {  
        
        db.query(`
        INSERT IGNORE INTO wordData${nation} (word, meaning) VALUES 
        ('${wordCopy}', '${formattedWordCopy2}');
        `,function(error, result){
        if (error) {throw error}
        if (result.affectedRows > 0) {  
          console.log(wordNum, '입력되었습니다.')
          res.send(true);
          res.end();
        } else {
          console.log(wordNum, '입력되지 않았습니다.')
          res.send(false);
          res.end();
        }})
      } else {
        console.log(wordNum, '이미 저장된 단어입니다.')
        res.send(false);
        res.end();      
    }})

  } catch (err) {
      console.error('Error:', err.message);
  }

});

router.get('/getworddataadmin2/:nation', async (req, res)=> { 

  var nationCopy = req.params.nation
  const nation = nationCopy === 'Itary' ? 'itary' : 'german';

  db.query(`
  select * from worddata${nation};
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


module.exports = router;
