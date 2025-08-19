// Jest setup file: set DB_NAME to use the suffixed test database
const baseDb = process.env.DB_NAME || 'postgres';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DB_NAME = `${baseDb}_test`;
