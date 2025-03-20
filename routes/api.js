const express = require('express');
const router = express.Router();
const db = require('../app').db; // ✅ 正确引入 db

// 1. 获取库存
router.get('/inventory', (req, res) => {
  db.query('SELECT * FROM components', (err, results) => {
    if (err) {
      res.status(500).send('数据库查询失败');
      return;
    }
    res.json(results);
  });
});

// 2. 提交借用申请
router.post('/borrow', (req, res) => {
  const { component_id, user_name, user_email, quantity, purpose, due_date } = req.body;
  const sql = `
    INSERT INTO borrow_records 
    (component_id, user_name, user_email, quantity, purpose, borrow_date, due_date, status) 
    VALUES (?, ?, ?, ?, ?, CURDATE(), ?, '正常')
  `;
  db.query(sql, [component_id, user_name, user_email, quantity, purpose, due_date], (err) => {
    if (err) {
      res.status(500).send('申请提交失败');
      return;
    }
    res.send('申请提交成功！');
  });
});

// 3. 获取借用记录
router.get('/borrow-records', (req, res) => {
  const sql = `
    SELECT 
      c.model,
      br.user_name,
      br.quantity,
      br.borrow_date,
      br.due_date,
      br.status
    FROM borrow_records br
    JOIN components c ON br.component_id = c.id
  `;
  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).send('查询失败');
      return;
    }
    res.json(results);
  });
});

// ✅ 正确导出路由对象
module.exports = router;

