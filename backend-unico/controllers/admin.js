import { query } from '../config/database.js';

// Buscar dados do dashboard
export async function getDashboardData(req, res) {
  try {
    console.log('[ADMIN DEBUG] Buscando dados do dashboard...');
    
    // Buscar estatísticas de usuários
    const usersResult = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive
      FROM users
    `);
    
    // Buscar estatísticas de empresas
    const companiesResult = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
      FROM companies
    `);
    
    // Buscar estatísticas de pagamentos
    const paymentsResult = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as total_revenue
      FROM payments
    `);
    
    // Buscar receita mensal (últimos 6 meses)
    const revenueResult = await query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(amount) as revenue,
        COUNT(*) as transactions
      FROM payments 
      WHERE status = 'approved' 
        AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `);
    
    const dashboardData = {
      users: usersResult.rows[0] || { total: 0, active: 0, inactive: 0 },
      companies: companiesResult.rows[0] || { total: 0, approved: 0, pending: 0, rejected: 0 },
      payments: paymentsResult.rows[0] || { total: 0, pending: 0, overdue: 0, approved: 0, total_revenue: 0 },
      revenue: {
        total: parseFloat(paymentsResult.rows[0]?.total_revenue || 0),
        monthly: revenueResult.rows[0]?.revenue || 0,
        growth: 12.5 // Mock por enquanto
      },
      revenueChart: revenueResult.rows.map(row => ({
        month: new Date(row.month).toLocaleDateString('pt-BR', { month: 'short' }),
        revenue: parseFloat(row.revenue),
        transactions: parseInt(row.transactions)
      }))
    };
    
    console.log('[ADMIN DEBUG] Dados do dashboard retornados');
    
    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('[ADMIN ERROR]:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// Buscar relatórios
export async function getReports(req, res) {
  try {
    console.log('[ADMIN DEBUG] Buscando relatórios...');
    
    const { startDate, endDate, type } = req.query;
    
    // Por enquanto, retornar dados mock
    const reportsData = {
      users: {
        total: 156,
        active: 142,
        inactive: 14,
        growth: 8.3
      },
      revenue: {
        total: 15600.00,
        monthly: 2800.00,
        growth: 12.5
      },
      companies: {
        total: 12,
        approved: 8,
        pending: 4
      }
    };
    
    res.json({
      success: true,
      data: reportsData
    });

  } catch (error) {
    console.error('[ADMIN ERROR]:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// Buscar configurações
export async function getSettings(req, res) {
  try {
    console.log('[ADMIN DEBUG] Buscando configurações...');
    
    // Por enquanto, retornar configurações mock
    const settingsData = {
      app: {
        name: 'Liga do Bem - Botucatu',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      },
      features: {
        userRegistration: true,
        companyRegistration: true,
        payments: true,
        reports: true
      },
      contact: {
        email: 'admin@ligadobem.org.br',
        phone: '(14) 3815-1234',
        address: 'Botucatu, SP'
      }
    };
    
    res.json({
      success: true,
      data: settingsData
    });

  } catch (error) {
    console.error('[ADMIN ERROR]:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
} 