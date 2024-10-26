const { PrismaClient } = require("@prisma/client");

const roleMiddleware = (allowedRoles) => {
  const prisma = new PrismaClient();

  const extractRoles = async (userId) => {
    const data = await prisma.$queryRaw`
      SELECT wf_roles.role_name 
      FROM wf_roleusermaps 
      JOIN wf_roles ON wf_roles.id = wf_roleusermaps.wf_role_id 
      WHERE wf_roleusermaps.user_id = ${userId} 
      AND wf_roles.is_suspended = false
    `;
    return data.map((item) => item.role_name);
  };

  return async (req, res, next) => {
    // Log the entire request body and headers
    // console.log("Incoming Request Body:", req.body);
    // console.log("Incoming Request Headers:", req.headers);

    const userDetails = req.body?.auth;
    const userId = userDetails?.id;

    // console.log("Allowed Roles: ", allowedRoles);
    console.log("User ID: ", userId);

    if (!userId) {
      return res.status(403).json({
        status: "error",
        message: "No valid user ID provided",
      });
    }

    try {
      const roleNames = await extractRoles(userId);

      if (roleNames.length === 0) {
        return res.status(403).json({
          status: "error",
          message: "No valid roles found for this user",
        });
      }

      console.log("User roles: ", roleNames);

      const hasPermission = roleNames.some((role) =>
        allowedRoles.includes(role)
      );

      if (!hasPermission) {
        return res.status(403).json({
          status: "error",
          message: "You do not have permission to access this resource.",
        });
      }

      next();
    } catch (error) {
      console.error("Error fetching user roles: ", error);
      res.status(500).json({
        status: "error",
        message: "An error occurred while checking permissions.",
      });
    }
  };
};

module.exports = roleMiddleware;
