const express = require('express');
const router = express.Router()
router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { db } = require('../db');
const multer  = require('multer')
var fs = require("fs");


// 추가 프로필 데이터 가져오기 ////
router.get('/getprofile/:user', (req, res) => {
var userAccount = req.params.user;
    db.query(`
    select * from user WHERE userAccount = '${userAccount}';
    `, function(error, result){
    if (error) {throw error}
    if (result.length > 0) {
        const carrerInputsCopy = result[0].carrerInputs ? JSON.parse(result[0].carrerInputs) : null;
        const videoLinksCopy = result[0].videoLinks ? JSON.parse(result[0].videoLinks) : null;
        const imageNamesCopy = result[0].imageNames ? JSON.parse(result[0].imageNames) : null;
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
    if (error) {throw error;}
    if (result.affectedRows > 0) {
        res.send(true);
        res.end();
    } else {
        res.send(false); 
        res.end();
    }
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


router.post("/deleteimage", async (req, res) => {
  const { imageNames } = req.body;
  try {
    if (imageNames.length > 0) {
        imageNames.forEach((image) => {
            if (fs.existsSync("build/images/upload_profile/" + image)) {
                fs.unlinkSync("build/images/upload_profile/" + image);
            } else {
                return
            }
        }).then(()=>{
            res.send(true);
            res.end();
        }).catch(()=>{
            res.send(error);
            res.end();        
        })
    } else {
        return
    }
  } catch (error) {
      res.send(error);
      res.end();
  }
});

module.exports = router;
