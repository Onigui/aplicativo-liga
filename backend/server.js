const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'liga-do-bem-secret-key';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configurar upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens e PDFs são permitidos'));
    }
  }
});

// Inicializar banco de dados
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error('Erro ao conectar com o banco:', err.message);
  } else {
    console.log('Conectado ao banco SQLite em memória');
    initDatabase();
  }
});

// Função para inicializar o banco
function initDatabase() {
  // Tabela de usuários
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      cpf TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      status TEXT DEFAULT 'active',
      monthly_value REAL DEFAULT 50.00,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de pagamentos
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      value REAL NOT NULL,
      month TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_method TEXT,
      receipt_url TEXT,
      notes TEXT,
      reviewed_by TEXT,
      reviewed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Inserir dados de teste
  insertTestData();
}

// Função para inserir dados de teste
function insertTestData() {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  const hashedUserPassword = bcrypt.hashSync('user123', 10);

  // Aguardar a criação das tabelas
  setTimeout(() => {
    // Inserir admin
    db.run(`
      INSERT OR IGNORE INTO users (name, cpf, email, phone, password, role, status)
      VALUES ('Admin Silva', '12345678901', 'admin@ligadobem.org.br', '14999887766', ?, 'admin', 'active')
    `, [hashedPassword], (err) => {
      if (err) console.log('Erro ao inserir admin:', err.message);
      else console.log('✅ Admin criado com sucesso');
    });

    // Inserir usuário teste
    db.run(`
      INSERT OR IGNORE INTO users (name, cpf, email, phone, password, role, status)
      VALUES ('João Silva', '98765432100', 'joao@email.com', '14988776655', ?, 'user', 'active')
    `, [hashedUserPassword], (err) => {
      if (err) console.log('Erro ao inserir usuário:', err.message);
      else console.log('✅ Usuário teste criado com sucesso');
    });

    // Inserir mais usuários de teste
    const testUsers = [
      ['Maria Oliveira', '11122233344', 'maria@email.com', '14977665544', 'user', 'active'],
      ['Pedro Santos', '55566677788', 'pedro@email.com', '14966554433', 'user', 'inactive'],
      ['Ana Costa', '99988877766', 'ana@email.com', '14955443322', 'user', 'active'],
      ['Carlos Silva', '12312312345', 'carlos@email.com', '14988776655', 'user', 'active'],
      ['Lucia Fernandes', '98798798712', 'lucia@email.com', '14977665544', 'user', 'active'],
      ['Roberto Lima', '45645645678', 'roberto@email.com', '14966554433', 'user', 'inactive'],
      ['Fernanda Santos', '78978978945', 'fernanda@email.com', '14955443322', 'user', 'active'],
      ['Paulo Mendes', '32132132156', 'paulo@email.com', '14944332211', 'user', 'active'],
      ['Juliana Alves', '65465465489', 'juliana@email.com', '14933221100', 'user', 'active'],
      ['Marcos Rodrigues', '85285285201', 'marcos@email.com', '14922110099', 'user', 'inactive']
    ];

    testUsers.forEach((user, index) => {
      setTimeout(() => {
        db.run(`
          INSERT OR IGNORE INTO users (name, cpf, email, phone, password, role, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [...user.slice(0, 4), hashedUserPassword, ...user.slice(4)], (err) => {
          if (err) console.log(`Erro ao inserir ${user[0]}:`, err.message);
          else console.log(`✅ Usuário ${user[0]} criado`);
        });
      }, index * 100);
    });

    // Inserir pagamentos de teste
    setTimeout(() => {
      const testPayments = [
        [2, 50.00, '2024-01', 'pending', 'pix', 'Pagamento via PIX'],
        [2, 50.00, '2023-12', 'approved', 'pix', 'Pagamento aprovado'],
        [3, 50.00, '2024-01', 'pending', 'boleto', 'Pagamento via boleto'],
        [4, 50.00, '2024-01', 'approved', 'pix', 'Pagamento janeiro'],
        [5, 50.00, '2023-12', 'approved', 'cartao', 'Pagamento dezembro'],
        [6, 50.00, '2024-01', 'rejected', 'pix', 'Comprovante ilegível'],
        [7, 50.00, '2024-01', 'pending', 'pix', 'Aguardando aprovação'],
        [8, 50.00, '2023-11', 'approved', 'boleto', 'Pagamento novembro']
      ];

      testPayments.forEach((payment, index) => {
        setTimeout(() => {
          db.run(`
            INSERT OR IGNORE INTO payments (user_id, value, month, status, payment_method, notes)
            VALUES (?, ?, ?, ?, ?, ?)
          `, payment, (err) => {
            if (err) console.log('Erro ao inserir pagamento:', err.message);
            else if (index === 0) console.log('✅ Pagamentos de teste criados');
          });
        }, index * 50);
      });
    }, 1500);
  }, 1000);
}

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token de acesso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acesso negado. Apenas administradores' });
  }
  next();
};

// ROTAS DE AUTENTICAÇÃO

// Login
app.post('/api/auth/login', (req, res) => {
  const { cpf, password } = req.body;

  if (!cpf || !password) {
    return res.status(400).json({ success: false, message: 'CPF e senha são obrigatórios' });
  }

  db.get('SELECT * FROM users WHERE cpf = ?', [cpf], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'CPF ou senha incorretos' });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ success: false, message: 'Conta desativada' });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'CPF ou senha incorretos' });
    }

    const token = jwt.sign(
      { id: user.id, cpf: user.cpf, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        name: user.name,
        cpf: user.cpf,
        email: user.email,
        role: user.role
      }
    });
  });
});

// Verificar token
app.post('/api/auth/verify-token', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.user.id,
      cpf: req.user.cpf,
      role: req.user.role
    }
  });
});

// Logout
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'Logout realizado com sucesso' });
});

// ROTAS DO DASHBOARD ADMIN

// Estatísticas do dashboard
app.get('/api/admin/dashboard', authenticateToken, requireAdmin, (req, res) => {
  const stats = {
    totalUsers: 156,
    activeUsers: 142,
    inactiveUsers: 14,
    totalRevenue: 15600.00,
    monthlyRevenue: 2800.00,
    pendingPayments: 8,
    overdue: 3,
    revenueGrowth: 12.5,
    userGrowth: 8.3,
    revenueChart: [
      { month: 'Jan', revenue: 2400, users: 35 },
      { month: 'Fev', revenue: 2200, users: 42 },
      { month: 'Mar', revenue: 2800, users: 38 },
      { month: 'Abr', revenue: 2600, users: 45 },
      { month: 'Mai', revenue: 3200, users: 52 },
      { month: 'Jun', revenue: 2900, users: 48 }
    ],
    alerts: [
      {
        id: 1,
        type: 'warning',
        message: '3 pagamentos vencidos',
        link: '/payments?status=overdue'
      },
      {
        id: 2,
        type: 'info',
        message: '8 pagamentos pendentes de aprovação',
        link: '/payments?status=pending'
      }
    ]
  };

  res.json(stats);
});

// ROTAS DE USUÁRIOS

// Listar usuários
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM users';
  let params = [];

  if (search) {
    query += ' WHERE name LIKE ? OR cpf LIKE ? OR email LIKE ?';
    params = [`%${search}%`, `%${search}%`, `%${search}%`];
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  db.all(query, params, (err, users) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao buscar usuários' });
    }

    // Remover senhas dos resultados
    const sanitizedUsers = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    // Contar total de usuários
    db.get('SELECT COUNT(*) as total FROM users', (err, count) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Erro ao contar usuários' });
      }

      res.json({
        users: sanitizedUsers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count.total / limit),
          totalItems: count.total,
          itemsPerPage: limit
        }
      });
    });
  });
});

// Detalhes do usuário
app.get('/api/admin/users/:id', authenticateToken, requireAdmin, (req, res) => {
  const userId = req.params.id;

  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao buscar usuário' });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    const { password, ...userWithoutPassword } = user;

    // Buscar histórico de pagamentos
    db.all('SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, payments) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Erro ao buscar pagamentos' });
      }

      res.json({
        user: {
          ...userWithoutPassword,
          paymentHistory: payments
        }
      });
    });
  });
});

// Toggle status do usuário
app.put('/api/admin/users/:id/toggle-status', authenticateToken, requireAdmin, (req, res) => {
  const userId = req.params.id;

  db.get('SELECT status FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao buscar usuário' });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    const newStatus = user.status === 'active' ? 'inactive' : 'active';

    db.run('UPDATE users SET status = ? WHERE id = ?', [newStatus, userId], (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Erro ao atualizar status' });
      }

      res.json({
        success: true,
        message: 'Status do usuário alterado com sucesso',
        user: { id: userId, status: newStatus }
      });
    });
  });
});

// ROTAS DE PAGAMENTOS

// Listar pagamentos
app.get('/api/admin/payments', authenticateToken, requireAdmin, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status || '';
  const offset = (page - 1) * limit;

  let query = `
    SELECT p.*, u.name as user_name, u.cpf as user_cpf 
    FROM payments p 
    JOIN users u ON p.user_id = u.id
  `;
  let params = [];

  if (status && status !== 'all') {
    query += ' WHERE p.status = ?';
    params.push(status);
  }

  query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  db.all(query, params, (err, payments) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao buscar pagamentos' });
    }

    // Contar total
    let countQuery = 'SELECT COUNT(*) as total FROM payments';
    let countParams = [];

    if (status && status !== 'all') {
      countQuery += ' WHERE status = ?';
      countParams.push(status);
    }

    db.get(countQuery, countParams, (err, count) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Erro ao contar pagamentos' });
      }

      res.json({
        payments: payments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count.total / limit),
          totalItems: count.total,
          itemsPerPage: limit
        }
      });
    });
  });
});

// Aprovar pagamento
app.put('/api/admin/payments/:id/approve', authenticateToken, requireAdmin, (req, res) => {
  const paymentId = req.params.id;
  const { notes } = req.body;

  db.run(`
    UPDATE payments 
    SET status = 'approved', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, notes = ?
    WHERE id = ?
  `, [req.user.name || 'Admin', notes || '', paymentId], (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao aprovar pagamento' });
    }

    res.json({
      success: true,
      message: 'Pagamento aprovado com sucesso',
      payment: {
        id: paymentId,
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        reviewedBy: req.user.name || 'Admin'
      }
    });
  });
});

// Rejeitar pagamento
app.put('/api/admin/payments/:id/reject', authenticateToken, requireAdmin, (req, res) => {
  const paymentId = req.params.id;
  const { reason } = req.body;

  db.run(`
    UPDATE payments 
    SET status = 'rejected', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, notes = ?
    WHERE id = ?
  `, [req.user.name || 'Admin', reason || '', paymentId], (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao rejeitar pagamento' });
    }

    res.json({
      success: true,
      message: 'Pagamento rejeitado',
      payment: {
        id: paymentId,
        status: 'rejected',
        reviewedAt: new Date().toISOString(),
        reviewedBy: req.user.name || 'Admin',
        rejectionReason: reason
      }
    });
  });
});

// ROTAS PARA O SITE PÚBLICO

// Cadastro de usuário
app.post('/api/auth/register', (req, res) => {
  const { name, cpf, email, phone, password } = req.body;

  if (!name || !cpf || !email || !password) {
    return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(`
    INSERT INTO users (name, cpf, email, phone, password, role, status)
    VALUES (?, ?, ?, ?, ?, 'user', 'active')
  `, [name, cpf, email, phone, hashedPassword], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ success: false, message: 'CPF ou email já cadastrado' });
      }
      return res.status(500).json({ success: false, message: 'Erro ao criar usuário' });
    }

    res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso',
      user: { id: this.lastID, name, cpf, email }
    });
  });
});

// Perfil do usuário
app.get('/api/user/profile', authenticateToken, (req, res) => {
  db.get('SELECT * FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao buscar perfil' });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });
});

// Pagamentos do usuário
app.get('/api/user/payments', authenticateToken, (req, res) => {
  db.all('SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, payments) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao buscar pagamentos' });
    }

    res.json({ payments });
  });
});

// Upload de comprovante
app.post('/api/user/upload-receipt', authenticateToken, upload.single('receipt'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });
  }

  const { month, value, paymentMethod, notes } = req.body;
  const receiptUrl = `/uploads/${req.file.filename}`;

  db.run(`
    INSERT INTO payments (user_id, value, month, payment_method, receipt_url, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `, [req.user.id, value, month, paymentMethod, receiptUrl, notes], function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao salvar pagamento' });
    }

    res.json({
      success: true,
      message: 'Comprovante enviado com sucesso',
      payment: {
        id: this.lastID,
        receiptUrl,
        status: 'pending'
      }
    });
  });
});

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend funcionando!' });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Erro interno do servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Saúde: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Login: http://localhost:${PORT}/api/auth/login`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Desligando servidor...');
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('📊 Banco de dados fechado.');
    process.exit(0);
  });
});