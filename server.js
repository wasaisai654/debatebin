const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// 确保数据目录存在
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// 用户管理
app.post('/api/users/register', async (req, res) => {
    try {
        await ensureDataDir();
        const { username, password } = req.body;
        
        const usersFile = path.join(DATA_DIR, 'users.json');
        let users = [];
        
        try {
            const data = await fs.readFile(usersFile, 'utf8');
            users = JSON.parse(data);
        } catch (error) {
            // 文件不存在，创建新数组
        }
        
        if (users.find(u => u.username === username)) {
            return res.status(400).json({ error: '用户名已存在' });
        }
        
        users.push({ username, password, createdAt: new Date() });
        await fs.writeFile(usersFile, JSON.stringify(users, null, 2));
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: '注册失败' });
    }
});

app.post('/api/users/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const usersFile = path.join(DATA_DIR, 'users.json');
        
        let users = [];
        try {
            const data = await fs.readFile(usersFile, 'utf8');
            users = JSON.parse(data);
        } catch (error) {
            return res.status(400).json({ error: '用户不存在' });
        }
        
        const user = users.find(u => u.username === username && u.password === password);
        if (!user) {
            return res.status(400).json({ error: '用户名或密码错误' });
        }
        
        res.json({ success: true, user: { username: user.username } });
    } catch (error) {
        res.status(500).json({ error: '登录失败' });
    }
});

// 留言管理
app.get('/api/messages', async (req, res) => {
    try {
        const messagesFile = path.join(DATA_DIR, 'messages.json');
        let messages = [];
        
        try {
            const data = await fs.readFile(messagesFile, 'utf8');
            messages = JSON.parse(data);
        } catch (error) {
            // 文件不存在，返回空数组
        }
        
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: '获取留言失败' });
    }
});

app.post('/api/messages', async (req, res) => {
    try {
        await ensureDataDir();
        const { username, content } = req.body;
        
        const messagesFile = path.join(DATA_DIR, 'messages.json');
        let messages = [];
        
        try {
            const data = await fs.readFile(messagesFile, 'utf8');
            messages = JSON.parse(data);
        } catch (error) {
            // 文件不存在，创建新数组
        }
        
        const message = {
            id: Date.now(),
            username,
            content,
            timestamp: new Date().toISOString()
        };
        
        messages.push(message);
        await fs.writeFile(messagesFile, JSON.stringify(messages, null, 2));
        
        res.json({ success: true, message });
    } catch (error) {
        res.status(500).json({ error: '发布留言失败' });
    }
});

// 资源管理
app.get('/api/resources', async (req, res) => {
    try {
        const resourcesFile = path.join(DATA_DIR, 'resources.json');
        let resources = [];
        
        try {
            const data = await fs.readFile(resourcesFile, 'utf8');
            resources = JSON.parse(data);
        } catch (error) {
            // 文件不存在，返回空数组
        }
        
        res.json(resources);
    } catch (error) {
        res.status(500).json({ error: '获取资源失败' });
    }
});

app.post('/api/resources', async (req, res) => {
    try {
        await ensureDataDir();
        const { username, title, description, link, file } = req.body;
        
        const resourcesFile = path.join(DATA_DIR, 'resources.json');
        let resources = [];
        
        try {
            const data = await fs.readFile(resourcesFile, 'utf8');
            resources = JSON.parse(data);
        } catch (error) {
            // 文件不存在，创建新数组
        }
        
        const resource = {
            id: Date.now(),
            username,
            title,
            description,
            link,
            file,
            timestamp: new Date().toISOString()
        };
        
        resources.push(resource);
        await fs.writeFile(resourcesFile, JSON.stringify(resources, null, 2));
        
        res.json({ success: true, resource });
    } catch (error) {
        res.status(500).json({ error: '发布资源失败' });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
    console.log(`访问 http://localhost:${PORT} 查看论坛`);
});
