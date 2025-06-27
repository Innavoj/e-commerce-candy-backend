const express = require('express');
const router = express.Router();

const db = require('../models'); // Import all models
const createGenericController = require('../controllers/generic.controller');
const authRoutes = require('./auth.routes'); // Import authentication routes
const orderController = require('../controllers/order.controller'); // Import the new specialized order controller

// Authentication routes
router.use('/auth', authRoutes);


// Helper function to create routes for a model
const createModelRoutes = (modelName, model, specificController = null, options = {}) => {
  const controller = specificController || createGenericController(model, options);
  const modelRouter = express.Router();

  modelRouter.post('/', controller.create);
  modelRouter.get('/', controller.findAll);
  modelRouter.get('/:id', controller.findOne);
  modelRouter.put('/:id', controller.update);
  modelRouter.delete('/:id', controller.delete);
  
  return modelRouter;
};

// --- Use the new specialized Order Controller ---
const orderRouter = express.Router();
orderRouter.post('/', orderController.create); // Specialized create method
orderRouter.get('/', orderController.findAll); // Generic method from the specialized controller
orderRouter.get('/:id', orderController.findOne);
orderRouter.put('/:id', orderController.update);
orderRouter.delete('/:id', orderController.delete);
router.use('/orders', orderRouter);
// --- End of Order Controller setup ---


// Generic CRUD routes for other models
router.use('/users', createModelRoutes('User', db.User)); // For admin/staff users if needed

// Customers can be created via /auth/register, but generic CRUD might be useful for admin
router.use('/customers', createModelRoutes('Customer', db.Customer, null, { include: [db.Order] }));

router.use('/addresses', createModelRoutes('Address', db.Address));

const categoryController = createGenericController(db.Category, { 
  include: [
    { model: db.Category, as: 'ParentCategory' }, 
    { model: db.Category, as: 'Subcategories' }
  ] 
});
router.use('/categories', createModelRoutes('Category', db.Category, categoryController));

router.use('/brands', createModelRoutes('Brand', db.Brand));

const productController = createGenericController(db.Product, { 
  include: [db.Category, db.Brand] 
});
router.use('/products', createModelRoutes('Product', db.Product, productController));

const orderItemControllerOptions = {
  include: [db.Product, db.Order]
};
router.use('/order-items', createModelRoutes('OrderItem', db.OrderItem, null, orderItemControllerOptions));

const paymentControllerOptions = {
  include: [db.Order]
};
router.use('/payments', createModelRoutes('Payment', db.Payment, null, paymentControllerOptions));


module.exports = router;