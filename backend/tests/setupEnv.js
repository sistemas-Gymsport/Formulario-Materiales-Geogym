import 'dotenv/config';

if (!process.env.TEST_DATABASE_URL) {
  throw new Error('Define TEST_DATABASE_URL (base de datos exclusiva para pruebas) antes de ejecutar las pruebas.');
}

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.INTEGRATION_ENCRYPTION_KEY ??= 'a'.repeat(64);
process.env.ALLOW_INSECURE_WEBHOOKS = 'true';
process.env.CORS_ORIGINS = 'http://localhost:5173';
process.env.COOKIE_SECURE = 'false';
