const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create a new resource
const createResource = async (name, description) => {
  return await prisma.resource.create({
    data: { name, description },
  });
};

// Update a resource by ID
const updateResource = async (id, name, description) => {
  return await prisma.resource.update({
    where: { id: Number(id) },
    data: { name, description },
  });
};

// Delete a resource by ID
const deleteResource = async (id) => {
  return await prisma.resource.delete({
    where: { id: Number(id) },
  });
};

module.exports = {
  createResource,
  updateResource,
  deleteResource,
};
