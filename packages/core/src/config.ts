export const isDevelopment = process.env.NODE_ENV === 'development';

export default {
  secret: process.env.SECRET || 'hVmYq3t6w9z$C&F)J@McQfTjWnZr4u7x',
  jwt: {
    secret: process.env.JWT_SECRET || 's3creti5S1m0',
    expiry: process.env.JWT_EXPIRY || '3d'
  }
};
