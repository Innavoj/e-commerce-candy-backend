// Generic controller to handle basic CRUD operations
const createGenericController = (model, options = {}) => {
  const { include = [] } = options; // For eager loading

  return {
    // Create a new item
    create: async (req, res) => {
      try {
        const item = await model.create(req.body);
        res.status(201).json(item);
      } catch (error) {
        res.status(400).json({ message: error.message, errors: error.errors });
      }
    },

    // Retrieve all items
    findAll: async (req, res) => {
      try {
        const items = await model.findAll({ include });
        res.status(200).json(items);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    },

    // Retrieve a single item by ID
    findOne: async (req, res) => {
      try {
        const item = await model.findByPk(req.params.id, { include });
        if (item) {
          res.status(200).json(item);
        } else {
          res.status(404).json({ message: `${model.name} not found` });
        }
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    },

    // Update an item by ID
    update: async (req, res) => {
      try {
        const [updated] = await model.update(req.body, {
          where: { [model.primaryKeyAttributes[0]]: req.params.id }
        });
        if (updated) {
          const updatedItem = await model.findByPk(req.params.id, { include });
          res.status(200).json(updatedItem);
        } else {
          res.status(404).json({ message: `${model.name} not found` });
        }
      } catch (error) {
        res.status(400).json({ message: error.message, errors: error.errors });
      }
    },

    // Delete an item by ID
    delete: async (req, res) => {
      try {
        const deleted = await model.destroy({
          where: { [model.primaryKeyAttributes[0]]: req.params.id }
        });
        if (deleted) {
          res.status(204).send(); // No content
        } else {
          res.status(404).json({ message: `${model.name} not found` });
        }
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
  };
};

module.exports = createGenericController;