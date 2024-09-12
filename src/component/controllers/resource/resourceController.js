const auditLogger = require("../../../utils/auditLog/auditLogger");
const resourceDao = require("../../dao/resource/resourceDao");

// Create a new resource
const createResource = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Call the DAO to create a new resource
    const newResource = await resourceDao.createResource(name, description);

    // Audit logging
    const userId = typeof req.user?.id === "number" ? req.user.id : 0;
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

    // Call the DAO to update the resource
    const updatedResource = await resourceDao.updateResource(
      id,
      name,
      description
    );

    // Audit logging
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
    console.error("Error updating resource:", error);
    res.status(500).json({ error: "Error updating resource" });
  }
};

// Delete a resource
const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    // Audit logging before deletion
    const userId = typeof req.user?.id === "number" ? req.user.id : 0;
    const ipAddress = req.ip || req.connection.remoteAddress;
    await auditLogger.log(
      userId,
      "DELETE",
      `Deleted resource with ID: ${id}`,
      ipAddress
    );

    // Call the DAO to delete the resource
    await resourceDao.deleteResource(id);

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
