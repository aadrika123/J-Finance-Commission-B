const auditLogger = require("../utils/auditLogger");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create a new resource
const createResource = async (req, res) => {
  try {
    const { name, description } = req.body;
    const newResource = await prisma.resource.create({
      data: { name, description },
    });

    const userId = typeof req.user?.id === "number" ? req.user.id : 0; // Ensure this is an integer, 0 for anonymous users
    const ipAddress = req.ip || req.connection.remoteAddress;
    await auditLogger.log(
      userId,
      "CREATE",
      `Created resource with ID: ${newResource.id}`,
      ipAddress
    );

    res.status(201).json(newResource);
  } catch (error) {
    console.error("Error creating resource:", error);
    res.status(500).json({ error: "Error creating resource" });
  }
};

// Update an existing resource
const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const updatedResource = await prisma.resource.update({
      where: { id: Number(id) },
      data: { name, description },
    });

    // Log the update action
    const userId = typeof req.user?.id === "number" ? req.user.id : 0;
    const ipAddress = req.ip || req.connection.remoteAddress;
    await auditLogger.log(
      userId,
      "UPDATE",
      `Updated resource with ID: ${id}`,
      ipAddress
    );

    res.status(200).json(updatedResource);
  } catch (error) {
    res.status(500).json({ error: "Error updating resource" });
  }
};

// Delete a resource
const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    // Log the delete action before deleting the resource
    const userId = typeof req.user?.id === "number" ? req.user.id : 0;
    const ipAddress = req.ip || req.connection.remoteAddress;
    await auditLogger.log(
      userId,
      "DELETE",
      `Deleted resource with ID: ${id}`,
      ipAddress
    );

    // Now delete the resource
    await prisma.resource.delete({
      where: { id: Number(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting resource:", error);
    res.status(500).json({ error: "Error deleting resource" });
  }
};

module.exports = {
  createResource,
  updateResource,
  deleteResource,
};
