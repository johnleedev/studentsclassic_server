const express = require('express');
const router = express.Router()
var cors = require('cors');
router.use(cors());

router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { db } = require('../db');
const axios = require('axios');

const admin = require("firebase-admin");
var serviceAccount = require("../studentsclassic-firebase-adminsdk-7crrg-ff8e09aa48.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



// 알림 리스트 가져오기
router.get('/usernotifiinfo/:account', async (req, res) => {
  var userAccount = req.params.account;
  db.query(`SELECT notifiAll, notifiBoard, notifiInfo, notifiNotice, notifiOurConcour 
           FROM user WHERE userAccount = '${userAccount}';
    `, function(error, result){
    if (error) {throw error}
    if (result.length === 0) {  
      res.send(false);
      res.end();
    } else {
      var json = JSON.stringify(result);
      const getData = JSON.parse(json);
      res.json(getData);
      res.end();
  }})
});



// 알림 설정하기 
router.post('/setting', async (req, res) => {
  const { userAccount, notifiAll, notifiBoard, notifiInfo, notifiNotice, notifiOurConcour } = req.body;
  db.query(`
    UPDATE user SET 
    notifiAll = '${notifiAll}',
    notifiBoard = '${notifiBoard}',
    notifiInfo = '${notifiInfo}',
    notifiNotice = '${notifiNotice}',
    notifiOurConcour = '${notifiOurConcour}'
    WHERE userAccount = '${userAccount}'
  `,function(error, result){
  if (error) {throw error}
  if (result.affectedRows > 0) {  
    res.send(true);
    res.end();
  } else {
    res.send(false);  
    res.end();
  }})
});



// 알림 보내기
router.post('/allsendnotifi', async (req, res) => {
  const { notifiTitle, notifiMessage } = req.body;
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const currentDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

  // 알림 title, message 저장
  db.query(`
    INSERT IGNORE INTO notification (notifiTitle, notifiMessage, date) VALUES 
  ('${notifiTitle}', '${notifiMessage}', '${currentDate}');
  `,function(error, result){
  if (error) {throw error}
  if (result.affectedRows > 0) {  
    const notifiData = {}
    
    notifiData.notifiTitle = notifiTitle;
    notifiData.notifiMessage = notifiMessage;
    
    // 알림 보낼 리스트 가져오기 & 알림 보내기
    db.query(`SELECT firebaseToken FROM user WHERE firebaseToken IS NOT NULL;
    `, async function(error, result) {
    if (error) {throw error}
    if (result.length === 0) {  
      res.send(false);
      res.end();
    } else {
      // 토큰 리스트 가져오기
      const deviceTokens = result.map((row) => row.firebaseToken);

      // 각 토큰에 대해 알림 보내기
      for (const token of deviceTokens) {
        const message = {
          token: token,
          notification: {
            title: notifiTitle,
            body: notifiMessage,
          },
          apns: {
            payload: { aps: { 'mutable-content': 1 } },
            fcm_options: { image: 'https://www.studentsclassic.com/img/appicon.png'}
          },
          android: {
            notification: { image: 'https://www.studentsclassic.com/img/appicon.png' }
          },
        };

        try {
          const response = await admin.messaging().send(message);
          console.log('Successfully sent message:', response);
        } catch (error) {
          console.log('Error sending message:', error);
        }
      }

      res.json(notifiData);
      res.end();

      }
    }
    ) 
  } else {
    res.send(false);  
    res.end();
  }})
});


// firebase 토큰 저장하기
router.post('/savefirebasetoken', async (req, res) => {
  const { token, userAccount } = req.body;
  db.query(`SELECT * FROM user WHERE firebaseToken = '${token}';
    `, function(error, result){
    if (error) {throw error}
    // 토큰이 없는 경우
    if (result.length === 0) {  
      db.query(`
        UPDATE user SET firebaseToken = '${token}' WHERE userAccount = '${userAccount}'
      `,function(error, result){
      if (error) {throw error}
      if (result.affectedRows > 0) {  
        res.send(true);
        res.end();
      } else {
        res.send(false);  
        res.end();
      }})
    // 토큰이 있는 경우
    } else {
      res.send(true);
      res.end();
  }})
});


// 알림 리스트 가져오기
router.get('/notifigetlist', async (req, res) => {
  
  db.query(`SELECT * FROM notification;
    `, function(error, result){
    if (error) {throw error}
    if (result.length === 0) {  
      res.send(false);
      res.end();
    } else {
      var json = JSON.stringify(result);
      const getData = JSON.parse(json);
      res.json(getData);
      res.end();
  }})
});


module.exports = router;
