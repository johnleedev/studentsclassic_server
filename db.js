// 클라우드 업로드용 (naver)
// var mysql = require('mysql');
// var db = mysql.createPool({
//   host     : 'localhost',
//   port     : '3306',
//   user     : 'root',
//   password : 'gksksla6985!',
//   database : 'studentsclassic'
// });

// // 내 컴퓨터 용
var mysql = require('mysql');
var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'gksksla',
  database : 'studentsclassic'
});
db.connect();

module.exports = {
  db
};