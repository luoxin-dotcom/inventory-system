// const express = require('express');
// const mysql = require('mysql');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const app = express();
// const path = require('path'); // 需在文件顶部引入 path 模块

// // 1. 数据库配置
// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '123456', // 替换为你的密码
//   database: 'inventory_db'
// });

// // 2. 导出 db 对象
// module.exports.db = db;

// // 3. 中间件配置
// app.use(cors());
// app.use(bodyParser.json());
// app.use(express.static('public'));
// // 托管静态文件（CSS/JS/图片）
// app.use(express.static(path.join(__dirname, 'public'))); 
// // 根路由指向首页
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'views', 'index.html'));
// });

// // 4. 路由注册
// app.use('/api', require('./routes/api'));

// // 5. 启动服务器
// app.listen(3020, () => {
//   console.log('服务器运行在 http://localhost:3020');
// });



// --------------------- 1. 初始化依赖和环境变量 ---------------------
// 在文件最顶部加载环境变量
require('dotenv').config();

const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
const app = express();

// --------------------- 2. 数据库配置 ---------------------
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'inventory_db'
});

// 导出 db 对象供路由使用
module.exports.db = db;

// --------------------- 3. 邮件配置（QQ邮箱） ---------------------
const transporter = nodemailer.createTransport({
  service: 'QQ',
  auth: {
    user: process.env.EMAIL_USER, // 必须从环境变量读取
    pass: process.env.EMAIL_PASS  // 必须从环境变量读取
  }
});

// --------------------- 4. 手动发送测试邮件 ---------------------
function sendTestEmail() {
  const mailOptions = {
    from: transporter.options.auth.user, // ✅ 直接引用配置的邮箱
    to: process.env.TEST_EMAIL || '1759297616@qq.com', // 测试邮箱
    subject: '测试邮件',
    text: '这是一封来自耗材管理系统的测试邮件！'
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('邮件发送失败:', {
        error: error.message,
        stack: error.stack
      });
    } else {
      console.log('邮件已发送:', info.response);
    }
  });
}

// 测试路由
app.get('/send-test-email', (req, res) => {
  sendTestEmail();
  res.send('已尝试发送测试邮件，请检查终端日志和邮箱！');
});

// --------------------- 5. 数据库连接测试 ---------------------
db.connect((err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err);
    process.exit(1);
  }
  console.log('✅ 数据库连接成功！');
});

// --------------------- 6. 中间件配置 ---------------------
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// --------------------- 7. 路由设置 ---------------------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});
app.use('/api', require('./routes/api'));

// --------------------- 8. 定时任务（每天9点发送提醒） ---------------------
schedule.scheduleJob('0 9 * * *', () => {
  const sql = `
    SELECT br.user_name, br.user_email, c.model, br.due_date 
    FROM borrow_records br
    JOIN components c ON br.component_id = c.id
    WHERE br.due_date = CURDATE() + INTERVAL 1 DAY
      AND br.status = '正常'
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('定时任务查询失败:', err);
      return;
    }

    // 添加延时发送（每5秒发一封）
    results.forEach((record, index) => {
      setTimeout(() => {
        const mailOptions = {
          from: transporter.options.auth.user,
          to: record.user_email,
          subject: '借用到期提醒',
          text: `您好，${record.user_name}！您借用的 ${record.model} 将于明天到期，请及时归还。\n\n（此为系统自动通知，无需回复）`
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('邮件发送失败:', {
              error: error.message,
              recipient: record.user_email,
              time: new Date().toISOString()
            });
          } else {
            console.log('通知已发送:', info.response);
          }
        });
      }, index * 5000); // 每5秒间隔
    });
  });
});

// --------------------- 9. 启动服务器 ---------------------
app.listen(3020, () => {
  console.log('🚀 服务器运行在 http://localhost:3020');
});