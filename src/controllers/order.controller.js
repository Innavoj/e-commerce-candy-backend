
const db = require('../models');
const { sequelize, Order, OrderItem, Product, Address } = db;
const createGenericController = require('./generic.controller');

// Inherit generic methods for findAll, findOne, etc.
const genericController = createGenericController(Order, {
  include: [
    db.Customer, 
    { model: db.Address, as: 'DeliveryAddress' },
    { model: db.OrderItem, include: [db.Product] },
    db.Payment
  ]
});

const orderController = {
  ...genericController,

  // Override the create method with our specific business logic
  create: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { customer_id, delivery_address, order_items, shipping_method, payment_method, customer_notes } = req.body;

      if (!customer_id || !delivery_address || !order_items || order_items.length === 0) {
        return res.status(400).json({ message: "Missing required fields: customer_id, delivery_address, or order_items." });
      }

      // 1. Create the address within the transaction
      const newAddress = await Address.create({ ...delivery_address }, { transaction: t });

      // 2. Securely calculate totals and check/decrement stock
      let calculatedTotal = 0;
      const productIds = order_items.map(item => item.product_id);
      const productsFromDb = await Product.findAll({ where: { product_id: productIds }, transaction: t });

      if (productsFromDb.length !== productIds.length) {
        throw new Error("One or more products not found in the database.");
      }
      
      const productMap = new Map(productsFromDb.map(p => [p.product_id, p]));

      for (const item of order_items) {
        const product = productMap.get(item.product_id);
        if (!product) {
          throw new Error(`Product with ID ${item.product_id} not found.`);
        }
        if (product.stock_quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Requested: ${item.quantity}, Available: ${product.stock_quantity}`);
        }
        
        // Use the price from the database for security
        calculatedTotal += product.price * item.quantity;
        
        // Decrement stock
        product.stock_quantity -= item.quantity;
        await product.save({ transaction: t });
      }
      
      // Example shipping cost logic
      const shippingCost = shipping_method === 'home_delivery' ? 5.00 : 0.00;
      const finalAmount = calculatedTotal + shippingCost;

      // 3. Create the order with calculated totals and new address ID
      const newOrder = await Order.create({
        customer_id,
        delivery_address_id: newAddress.address_id,
        total_amount: calculatedTotal,
        shipping_cost: shippingCost,
        final_amount: finalAmount,
        status: 'processing', // A more appropriate status after successful creation
        payment_status: 'paid', // Assuming payment is successful. A real system would use webhooks.
        shipping_method,
        payment_method,
        customer_notes,
      }, { transaction: t });

      // 4. Create order items with correct prices from the DB
      const orderItemsToCreate = order_items.map(item => {
        const product = productMap.get(item.product_id);
        return {
          order_id: newOrder.order_id,
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_purchase: product.price, // Use the secure price from the DB
        };
      });

      await OrderItem.bulkCreate(orderItemsToCreate, { transaction: t });

      // 5. If everything is successful, commit the transaction
      await t.commit();
      
      // 6. Respond with the full created order for confirmation page
      const finalOrder = await Order.findByPk(newOrder.order_id, {
          include: [
            db.Customer, 
            { model: db.Address, as: 'DeliveryAddress' },
            { model: db.OrderItem, include: [db.Product] },
            db.Payment
          ]
      });

      res.status(201).json(finalOrder);

    } catch (error) {
      // If any step fails, roll back the entire transaction
      await t.rollback();
      console.error("Order creation failed:", error);
      // Send a specific error message if available, otherwise a generic one
      res.status(400).json({ message: error.message || "Failed to create order due to a server error." });
    }
  }
};

module.exports = orderController;