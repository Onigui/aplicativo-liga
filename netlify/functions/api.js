// Netlify Function para API - Liga do Bem
// Substitui o json-server em produção

const fs = require('fs');
const path = require('path');

// Dados em memória (em produção, use um banco de dados real)
let companies = [
  {
    "id": 1,
    "companyName": "Farmácia Central",
    "cnpj": "12.345.678/0001-90",
    "address": "Rua das Flores, 123, Centro, Botucatu-SP",
    "phone": "(14) 3322-1111",
    "email": "contato@farmaciacentral.com.br",
    "discount": "15%",
    "description": "Desconto em medicamentos e produtos de higiene",
    "status": "approved",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "companyName": "Pet Shop Amigo Fiel",
    "cnpj": "98.765.432/0001-10",
    "address": "Av. Dom Aguirre, 456, Vila Assunção, Botucatu-SP",
    "phone": "(14) 3355-2222",
    "email": "contato@amigofiel.com.br",
    "discount": "20%",
    "description": "Desconto em ração, brinquedos e acessórios para pets",
    "status": "approved",
    "createdAt": "2024-01-20T14:15:00Z"
  }
];

let users = [
  {
    "id": 1,
    "name": "Maria Silva",
    "cpf": "12345678901",
    "password": "123456",
    "createdAt": "2024-01-10T08:00:00Z"
  }
];

exports.handler = async (event, context) => {
  const { httpMethod, path: requestPath, body, queryStringParameters } = event;
  
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Handle preflight requests
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const route = requestPath.replace('/.netlify/functions/api', '');
    console.log(`${httpMethod} ${route}`);
    
    // COMPANIES ROUTES
    if (route.startsWith('/companies')) {
      switch (httpMethod) {
        case 'GET':
          if (route === '/companies') {
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify(companies)
            };
          }
          
          const idMatch = route.match(/\/companies\/(\d+)/);
          if (idMatch) {
            const id = parseInt(idMatch[1]);
            const company = companies.find(c => c.id === id);
            if (company) {
              return {
                statusCode: 200,
                headers,
                body: JSON.stringify(company)
              };
            } else {
              return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Company not found' })
              };
            }
          }
          break;

        case 'POST':
          if (route === '/companies') {
            const newCompany = JSON.parse(body);
            newCompany.id = Math.max(...companies.map(c => c.id), 0) + 1;
            newCompany.status = 'pending';
            newCompany.createdAt = new Date().toISOString();
            companies.push(newCompany);
            
            return {
              statusCode: 201,
              headers,
              body: JSON.stringify(newCompany)
            };
          }
          break;

        case 'PUT':
          const putIdMatch = route.match(/\/companies\/(\d+)/);
          if (putIdMatch) {
            const id = parseInt(putIdMatch[1]);
            const updatedData = JSON.parse(body);
            const index = companies.findIndex(c => c.id === id);
            
            if (index !== -1) {
              companies[index] = { ...companies[index], ...updatedData };
              return {
                statusCode: 200,
                headers,
                body: JSON.stringify(companies[index])
              };
            } else {
              return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Company not found' })
              };
            }
          }
          break;

        case 'DELETE':
          const deleteIdMatch = route.match(/\/companies\/(\d+)/);
          if (deleteIdMatch) {
            const id = parseInt(deleteIdMatch[1]);
            const index = companies.findIndex(c => c.id === id);
            
            if (index !== -1) {
              companies.splice(index, 1);
              return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: 'Company deleted' })
              };
            } else {
              return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Company not found' })
              };
            }
          }
          break;
      }
    }

    // USERS ROUTES
    if (route.startsWith('/users')) {
      switch (httpMethod) {
        case 'GET':
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(users.map(u => ({ ...u, password: undefined })))
          };

        case 'POST':
          if (route === '/users/login') {
            const { cpf, password } = JSON.parse(body);
            const user = users.find(u => u.cpf === cpf && u.password === password);
            
            if (user) {
              const token = 'token_' + Date.now();
              return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                  success: true,
                  user: { ...user, password: undefined },
                  token
                })
              };
            } else {
              return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                  success: false,
                  message: 'CPF ou senha incorretos'
                })
              };
            }
          }

          if (route === '/users/register') {
            const { name, cpf, password } = JSON.parse(body);
            
            // Verificar se CPF já existe
            if (users.find(u => u.cpf === cpf)) {
              return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                  success: false,
                  message: 'CPF já cadastrado'
                })
              };
            }

            const newUser = {
              id: Math.max(...users.map(u => u.id), 0) + 1,
              name,
              cpf,
              password,
              createdAt: new Date().toISOString()
            };
            
            users.push(newUser);
            
            return {
              statusCode: 201,
              headers,
              body: JSON.stringify({
                success: true,
                user: { ...newUser, password: undefined }
              })
            };
          }
          break;
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Route not found' })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};