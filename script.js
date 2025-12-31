// 用户认证管理
let currentUser = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadMessages();
    loadResources();
    checkAuth();
});

// 认证相关函数
function showLogin() {
    document.getElementById('authModal').style.display = 'block';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showRegister() {
    document.getElementById('authModal').style.display = 'block';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function closeModal() {
    document.getElementById('authModal').style.display = 'none';
}

function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('registerBtn').style.display = 'none';
        document.getElementById('userInfo').style.display = 'inline';
        document.getElementById('username').textContent = currentUser.username;
        document.getElementById('uploadSection').style.display = 'block';
    }
}

function register() {
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    
    if (username && password) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.find(u => u.username === username)) {
            alert('用户名已存在！');
            return;
        }
        
        users.push({username, password});
        localStorage.setItem('users', JSON.stringify(users));
        alert('注册成功！');
        closeModal();
    }
}

function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        checkAuth();
        closeModal();
    } else {
        alert('用户名或密码错误！');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('loginBtn').style.display = 'inline';
    document.getElementById('registerBtn').style.display = 'inline';
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'none';
}

// 留言功能
document.getElementById('messageForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!currentUser) {
        alert('请先登录！');
        return;
    }
    
    const content = document.getElementById('messageContent').value;
    if (content) {
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        messages.push({
            id: Date.now(),
            username: currentUser.username,
            content: content,
            timestamp: new Date().toLocaleString()
        });
        localStorage.setItem('messages', JSON.stringify(messages));
        document.getElementById('messageContent').value = '';
        loadMessages();
    }
});

function loadMessages() {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const messagesList = document.getElementById('messagesList');
    messagesList.innerHTML = '';
    
    messages.reverse().forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message-item';
        messageDiv.innerHTML = `
            <strong>${message.username}</strong>
            <small>${message.timestamp}</small>
            <p>${message.content}</p>
        `;
        messagesList.appendChild(messageDiv);
    });
}

// 资源分享功能
document.getElementById('resourceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('resourceTitle').value;
    const description = document.getElementById('resourceDescription').value;
    const link = document.getElementById('resourceLink').value;
    const fileInput = document.getElementById('resourceFile');
    
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        if (file.size > 102400) {
            alert('文件大小不能超过100KB！');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            saveResource(title, description, link, {
                name: file.name,
                data: e.target.result,
                type: file.type
            });
        };
        reader.readAsDataURL(file);
    } else {
        saveResource(title, description, link, null);
    }
});

function saveResource(title, description, link, file) {
    const resources = JSON.parse(localStorage.getItem('resources') || '[]');
    resources.push({
        id: Date.now(),
        username: currentUser.username,
        title: title,
        description: description,
        link: link,
        file: file,
        timestamp: new Date().toLocaleString()
    });
    localStorage.setItem('resources', JSON.stringify(resources));
    
    // 重置表单
    document.getElementById('resourceForm').reset();
    loadResources();
}

function loadResources() {
    const resources = JSON.parse(localStorage.getItem('resources') || '[]');
    const resourcesList = document.getElementById('resourcesList');
    resourcesList.innerHTML = '';
    
    resources.reverse().forEach(resource => {
        const resourceDiv = document.createElement('div');
        resourceDiv.className = 'resource-item';
        
        let fileHtml = '';
        if (resource.file) {
            fileHtml = `<p><a href="${resource.file.data}" download="${resource.file.name}">下载文件: ${resource.file.name}</a></p>`;
        }
        
        resourceDiv.innerHTML = `
            <h4>${resource.title}</h4>
            <p>${resource.description}</p>
            ${resource.link ? `<p><a href="${resource.link}" target="_blank">访问链接</a></p>` : ''}
            ${fileHtml}
            <small>分享者: ${resource.username} | ${resource.timestamp}</small>
        `;
        resourcesList.appendChild(resourceDiv);
    });
}
