import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

function getMongoUri(): string {
  const uri = (process.env.MONGODB_URI || '').trim();

  if (!uri) {
    throw new Error(
      'MONGODB_URI is not defined. Set it in your environment (e.g. MongoDB Atlas connection string).'
    );
  }

  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new Error(
      'MONGODB_URI must start with mongodb:// or mongodb+srv://'
    );
  }

  const isLocalhost =
    uri.includes('127.0.0.1') ||
    uri.includes('localhost') ||
    uri.includes('0.0.0.0');

  if (process.env.NODE_ENV === 'production' && isLocalhost) {
    throw new Error(
      'MONGODB_URI points to localhost, which cannot work on Railway/production. Use a MongoDB Atlas connection string.'
    );
  }

  return uri;
}

/** Never log credentials — strip userinfo from URI for diagnostics. */
function redactMongoUri(uri: string): string {
  try {
    const parsed = new URL(uri);
    if (parsed.username || parsed.password) {
      parsed.username = '***';
      parsed.password = '***';
    }
    return parsed.toString();
  } catch {
    return 'mongodb://***';
  }
}

export const connectDatabase = async (retries = MAX_RETRIES): Promise<void> => {
  const uri = getMongoUri();

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      heartbeatFrequencyMS: 2000,
    });

    logger.info('✅ MongoDB connected successfully');
    logger.info(`📊 Database: ${mongoose.connection.name}`);
    logger.info(`🔗 Host: ${redactMongoUri(uri)}`);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected successfully');
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`MongoDB connection attempt failed: ${message}`);

    if (retries > 0) {
      logger.warn(
        `Retrying in ${RETRY_DELAY / 1000}s... (${retries} retries left)`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return connectDatabase(retries - 1);
    }

    logger.error(
      'MongoDB connection failed after all retries. Server will not start.'
    );
    throw new Error(
      `Unable to connect to MongoDB (${redactMongoUri(uri)}): ${message}`
    );
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
};
