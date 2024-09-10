const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const seedULBs = async () => {
  const ulbData = [
    {
      id: 3,
      ulb_name: "Basukinath Nagar Panchayat",
      latitude: 24.3864,
      longitude: 87.0799,
    },
    {
      id: 43,
      ulb_name: "Saraikela Nagar Panchayat",
      latitude: 22.698,
      longitude: 85.9317,
    },
    {
      id: 32,
      ulb_name: "Mango NAC",
      latitude: 22.8282,
      longitude: 86.2116,
    },
    {
      id: 5,
      ulb_name: "Bundu Nagar Panchayat",
      latitude: 23.1747,
      longitude: 85.5791,
    },
    {
      id: 1,
      ulb_name: "Adityapur Municipal Corporation",
      latitude: 22.7866,
      longitude: 86.166,
    },
    {
      id: 2,
      ulb_name: "Ranchi Municipal Corporation",
      latitude: 23.3775,
      longitude: 85.3244,
    },
    {
      id: 34,
      ulb_name: "Medininagar Nagar Parishad",
      latitude: 28.8344,
      longitude: 77.5699,
    },
    {
      id: 38,
      ulb_name: "Phusro Nagar Parishad",
      latitude: 23.7635,
      longitude: 86.001,
    },
    {
      id: 23,
      ulb_name: "Jamshedpur NAC",
      latitude: 22.8005,
      longitude: 86.2053,
    },
    {
      id: 25,
      ulb_name: "Jhumritilaiya Nagar Parishad",
      latitude: 24.4315,
      longitude: 85.531,
    },
    {
      id: 42,
      ulb_name: "Sahibganj Nagar Parishad",
      latitude: 25.2425,
      longitude: 87.6322,
    },
    {
      id: 6,
      ulb_name: "Chaibasa Nagar Parishad",
      latitude: 22.5513,
      longitude: 85.8084,
    },
    {
      id: 7,
      ulb_name: "Chakradharpur Nagar Parishad",
      latitude: 22.6806,
      longitude: 85.6147,
    },
    {
      id: 9,
      ulb_name: "Chas Municipal Corporation",
      latitude: 23.6362,
      longitude: 86.1828,
    },
    {
      id: 10,
      ulb_name: "Chatra Nagar Parishad",
      latitude: 24.2015,
      longitude: 84.8985,
    },
    {
      id: 12,
      ulb_name: "Chirkunda Nagar Panchayat",
      latitude: 23.7479,
      longitude: 86.7869,
    },
    {
      id: 14,
      ulb_name: "Deoghar Municipal Corporation",
      latitude: 24.4852,
      longitude: 86.6948,
    },
    {
      id: 15,
      ulb_name: "Dhanbad Municipal Corporation",
      latitude: 23.7957,
      longitude: 86.4304,
    },
    {
      id: 17,
      ulb_name: "Garhwa Nagar Parishad",
      latitude: 24.1549,
      longitude: 83.7996,
    },
    {
      id: 18,
      ulb_name: "Giridih Municipal Corporation",
      latitude: 24.1913,
      longitude: 86.2996,
    },
    {
      id: 19,
      ulb_name: "Godda Nagar Panchayat",
      latitude: 24.8255,
      longitude: 87.2135,
    },
    {
      id: 21,
      ulb_name: "Hazaribagh Municipal Corporation",
      latitude: 23.9925,
      longitude: 85.3637,
    },
    {
      id: 22,
      ulb_name: "Hussainabad Nagar Panchayat",
      latitude: 24.5336,
      longitude: 84.0002,
    },
    {
      id: 4,
      ulb_name: "Bishrampur Nagar Parishad",
      latitude: 24.2521,
      longitude: 83.9254,
    },
    {
      id: 26,
      ulb_name: "Jugsalai Municipality",
      latitude: 22.7739,
      longitude: 86.1892,
    },
    {
      id: 28,
      ulb_name: "Koderma Nagar Panchayat",
      latitude: 24.476,
      longitude: 85.5937,
    },
    {
      id: 29,
      ulb_name: "Latehar Nagar Panchayat",
      latitude: 23.7453,
      longitude: 84.4964,
    },
    {
      id: 33,
      ulb_name: "Manjhiaon Nagar Panchayat",
      latitude: 24.3231,
      longitude: 83.8123,
    },
    {
      id: 45,
      ulb_name: "West Singbhum",
      latitude: 22.3651,
      longitude: 85.4376,
    },
    {
      id: 44,
      ulb_name: "Simdega Nagar Parishad",
      latitude: 22.6133,
      longitude: 84.5018,
    },
    {
      id: 40,
      ulb_name: "Ramgarh Nagar Parishad",
      latitude: 23.6363,
      longitude: 85.5124,
    },
    {
      id: 30,
      ulb_name: "Lohardaga Nagar Parishad",
      latitude: 23.4416,
      longitude: 84.687,
    },
    {
      id: 31,
      ulb_name: "Madhupur Nagar Parishad",
      latitude: 24.2659,
      longitude: 86.6467,
    },
    {
      id: 37,
      ulb_name: "Pakur Nagar Parishad",
      latitude: 24.6377,
      longitude: 87.8353,
    },
    {
      id: 35,
      ulb_name: "Mihijham Nagar Parishad",
      latitude: 23.8473,
      longitude: 86.8825,
    },
    {
      id: 36,
      ulb_name: "Nagar Uttari Nagar Panchayat",
      latitude: 24.2845,
      longitude: 83.5017,
    },
    {
      id: 39,
      ulb_name: "Rajmahal Nagar Panchayat",
      latitude: 25.0556,
      longitude: 87.8338,
    },
    {
      id: 8,
      ulb_name: "Chakulia Nagar Panchayat",
      latitude: 0.0, // Default values for missing lat/long
      longitude: 0.0,
    },
    {
      id: 16,
      ulb_name: "Dumka Nagar Parishad",
      latitude: 24.2685,
      longitude: 87.2488,
    },
    {
      id: 20,
      ulb_name: "Gumla Nagar Parishad",
      latitude: 23.0441,
      longitude: 84.5379,
    },
    {
      id: 24,
      ulb_name: "Jamtara Nagar Panchayat",
      latitude: 23.9612,
      longitude: 86.8048,
    },
    {
      id: 27,
      ulb_name: "Khunti Nagar Panchayat",
      latitude: 23.0581,
      longitude: 85.2847,
    },
  ];

  try {
    // Insert new data
    for (const ulb of ulbData) {
      await prisma.ULB.create({
        data: {
          id: ulb.id,
          ulb_name: ulb.ulb_name,
          latitude: ulb.latitude,
          longitude: ulb.longitude,
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
