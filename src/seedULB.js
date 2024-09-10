const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const seedULBs = async () => {
  const ulbNames = [
    "Adityapur Municipal Corporation",
    "Basukinath Nagar Panchayat",
    "Bishrampur Nagar Parishad",
    "Bundu Nagar Panchayat",
    "Chaibasa Nagar Parishad",
    "Chakradharpur Nagar Parishad",
    "Chakulia Nagar Panchayat",
    "Chas Municipal Corporation",
    "Chatra Nagar Parishad",
    "Chirkunda Nagar Panchayat",
    "Deoghar Municipal Corporation",
    "Dhanbad Municipal Corporation",
    "Dumka Nagar Parishad",
    "Garhwa Nagar Parishad",
    "Giridih Municipal Corporation",
    "Godda Nagar Panchayat",
    "Gumla Nagar Parishad",
    "Hazaribagh Municipal Corporation",
    "Hussainabad Nagar Panchayat",
    "Jamshedpur NAC",
    "Jamtara Nagar Panchayat",
    "Jhumritilaiya Nagar Parishad",
    "Jugsalai Municipality",
    "Khunti Nagar Panchayat",
    "Koderma Nagar Panchayat",
    "Latehar Nagar Panchayat",
    "Lohardaga Nagar Parishad",
    "Madhupur Nagar Parishad",
    "Mango NAC",
    "Manjhiaon Nagar Panchayat",
    "Medininagar Nagar Parishad",
    "Mihijham Nagar Parishad",
    "Nagar Uttari Nagar Panchayat",
    "Pakur Nagar Parishad",
    "Phusro Nagar Parishad",
    "Rajmahal Nagar Panchayat",
    "Ramgarh Nagar Parishad",
    "Ranchi Municipal Corporation",
    "Sahibganj Nagar Parishad",
    "Saraikela Nagar Panchayat",
    "Simdega Nagar Parishad",
    "West Singbhum",
  ];

  try {
    // Insert new data
    for (const ulb_name of ulbNames) {
      await prisma.ULB.create({
        data: {
          ulb_name,
          longitude: 0, // Set default values or modify as needed
          latitude: 0, // Set default values or modify as needed
        },
      });
    }

    console.log("ULBs seeded successfully.");
  } catch (error) {
    console.error("Error seeding ULBs:", error);
  } finally {
    await prisma.$disconnect();
  }
};

seedULBs();
