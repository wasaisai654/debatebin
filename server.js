const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 确保有 API 路由
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running on Node.js 24!' });
});

// 其他路由...

// 导出给 Vercel 使用
module.exports = app;
