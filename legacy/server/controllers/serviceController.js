import Service from '../models/serviceModel.js';

// @desc    Create a service (Admin only)
export const createService = async (req, res) => {
  try {
    const { name, description, price, duration, category } = req.body;

    const service = await new Service.create({
      name,
      description,
      price,
      duration,
      category,
    });

    res.status(201).json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all services (Anyone)
export const getServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a service (Admin only)
export const updateService = async (req, res) => {
  try {
    const { name, description, price, duration, category } = req.body;
    
    const service = await Service.findById(req.query.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    service.name = name || service.name;
    service.description = description || service.description;
    service.price = price || service.price;
    service.duration = duration || service.duration;
    service.category = category || service.category;

    await service.save();
    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a service (Admin only)
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.query.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    await service.deleteOne();
    res.json({ message: 'Service removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};