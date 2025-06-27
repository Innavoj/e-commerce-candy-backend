const app = require('./app');
const db = require('./models'); // Imports sequelize instance and models

const PORT = process.env.PORT || 3001;

// Sync database and start server
db.sequelize.sync({ 
  // force: process.env.NODE_ENV === 'development' // Careful: force:true will drop tables. Use with caution.
  // alter: process.env.NODE_ENV === 'development' // alter:true will attempt to update tables. Safer.
}).then(() => {
  console.log('Database synced successfully.');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
  });
}).catch(err => {
  console.error('Unable to connect to the database or sync:', err);
});