const express = require('express');
const path = require('path');
const app = express();
const { db } = require('./db');

var bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
var cors = require('cors');

// 라우터들
var loginRouter = require('./routes/login')
var HomeRouter = require('./routes/Home')
var BoardRouter = require('./routes/Board')
var CompetitionRouter = require('./routes/Competition')
var NoticeRouter = require('./routes/Notice')
var Notification = require('./routes/Notification')
var Concours = require('./routes/Concours')
var Concert = require('./routes/Concert')
var Recruit = require('./routes/Recruit')
var MypageRouter = require('./routes/Mypage')
app.use('/login', loginRouter);
app.use('/home', HomeRouter);
app.use('/board', BoardRouter);
app.use('/competition', CompetitionRouter);
app.use('/notice', NoticeRouter);
app.use('/notification', Notification);
app.use('/concours', Concours);
app.use('/concert', Concert);
app.use('/recruit', Recruit);
app.use('/mypage', MypageRouter);


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

