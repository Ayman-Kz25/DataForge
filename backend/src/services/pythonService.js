const axios = require('axios');
const logger = require('../utils/logger');

const PYTHON_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

const pythonClient = axios.create({
  baseURL: PYTHON_URL,
  timeout: 300000,
});

exports.profile = async (payload) => {
  try {
    const { data } = await pythonClient.post('/profile', payload);
    return data;
  } catch (err) {
    logger.error(`Python profiling error: ${err.message}`);
    throw new Error('Data profiling failed. Please try again.');
  }
};

exports.validate = async (payload) => {
  try {
    const { data } = await pythonClient.post('/validate', payload);
    return data;
  } catch (err) {
    logger.error(`Python validation error: ${err.message}`);
    throw new Error('Data validation failed. Please try again.');
  }
};

exports.detectAnomalies = async (payload) => {
  try {
    const { data } = await pythonClient.post('/anomalies', payload);
    return data;
  } catch (err) {
    logger.error(`Python anomaly detection error: ${err.message}`);
    throw new Error('Anomaly detection failed. Please try again.');
  }
};

exports.clean = async (payload) => {
  try {
    const { data } = await pythonClient.post('/clean', payload);
    return data;
  } catch (err) {
    logger.error(`Python cleaning error: ${err.message}`);
    throw new Error('Data cleaning failed. Please try again.');
  }
};

exports.generateAnalytics = async (payload) => {
  try {
    const { data } = await pythonClient.post('/analytics', payload);
    return data;
  } catch (err) {
    logger.error(`Python analytics error: ${err.message}`);
    throw new Error('Analytics generation failed. Please try again.');
  }
};

exports.generatePdfReport = async (payload) => {
  try {
    const { data } = await pythonClient.post('/reports/pdf', payload, {
      responseType: 'arraybuffer'
    });
    return Buffer.from(data);
  } catch (err) {
    logger.error(`Python PDF generation error: ${err.message}`);
    throw new Error('Report generation failed. Please try again.');
  }
};
