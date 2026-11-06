// MongoDB Docker initialization script
db = db.getSiblingDB('ecommerce_devops');

db.createUser({
  user: 'app_user',
  pwd: 'app_password_2026',
  roles: [
    {
      role: 'readWrite',
      db: 'ecommerce_devops'
    }
  ]
});

print('✅ Created ecommerce_devops database and application user.');
