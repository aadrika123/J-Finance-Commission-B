const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const seedULBs = async () => {
  const ulbData = [
    {
      id: 1,
      ulb_name: "Adityapur Municipal Corporation",
      latitude: 22.7866,
      longitude: 86.166,
      city_type: "non million",
    },
    {
      id: 2,
      ulb_name: "Ranchi Municipal Corporation",
      latitude: 23.3775,
      longitude: 85.3244,
      city_type: "million plus",
    },
    {
      id: 3,
      ulb_name: "Basukinath Nagar Panchayat",
      latitude: 24.3864,
      longitude: 87.0799,
      city_type: "non million",
    },
    {
      id: 4,
      ulb_name: "Bishrampur Nagar Parishad",
      latitude: 24.2521,
      longitude: 83.9254,
      city_type: "non million",
    },
    {
      id: 5,
      ulb_name: "Bundu Nagar Panchayat",
      latitude: 23.1747,
      longitude: 85.5791,
      city_type: "non million",
    },
    {
      id: 6,
      ulb_name: "Chaibasa Nagar Parishad",
      latitude: 22.5513,
      longitude: 85.8084,
      city_type: "non million",
    },
    {
      id: 7,
      ulb_name: "Chakradharpur Nagar Parishad",
      latitude: 22.6806,
      longitude: 85.6147,
      city_type: "non million",
    },
    {
      id: 8,
      ulb_name: "Chakulia Nagar panchayat",
      latitude: 22.4736,
      longitude: 86.7146,
      city_type: "non million",
    },
    {
      id: 9,
      ulb_name: "Chas Municipal Corporation",
      latitude: 23.6362,
      longitude: 86.1828,
      city_type: "non million",
    },
    {
      id: 10,
      ulb_name: "Chatra Nagar Parishad",
      latitude: 24.2015,
      longitude: 84.8985,
      city_type: "non million",
    },
    {
      id: 12,
      ulb_name: "Chirkunda Nagar Panchayat",
      latitude: 23.7479,
      longitude: 86.7869,
      city_type: "non million",
    },
    {
      id: 14,
      ulb_name: "Deoghar Municipal Corporation",
      latitude: 24.4852,
      longitude: 86.6948,
      city_type: "non million",
    },
    {
      id: 15,
      ulb_name: "Dhanbad Municipal Corporation",
      latitude: 23.7957,
      longitude: 86.4304,
      city_type: "million plus",
    },
    {
      id: 16,
      ulb_name: "Dumka Nagar Parishad",
      latitude: 24.2685,
      longitude: 87.2488,
      city_type: "non million",
    },
    {
      id: 17,
      ulb_name: "Garhwa Nagar Parishad",
      latitude: 24.1549,
      longitude: 83.7996,
      city_type: "non million",
    },
    {
      id: 18,
      ulb_name: "Giridih Municipal Corporation",
      latitude: 24.1913,
      longitude: 86.2996,
      city_type: "non million",
    },
    {
      id: 19,
      ulb_name: "Godda Nagar Panchayat",
      latitude: 24.8255,
      longitude: 87.2135,
      city_type: "non million",
    },
    {
      id: 20,
      ulb_name: "Gumla Nagar Parishad",
      latitude: 23.0441,
      longitude: 84.5379,
      city_type: "non million",
    },
    {
      id: 21,
      ulb_name: "Hazaribagh Municipal Corporation",
      latitude: 23.9925,
      longitude: 85.3637,
      city_type: "non million",
    },
    {
      id: 22,
      ulb_name: "Hussainabad Nagar Panchayat",
      latitude: 24.5336,
      longitude: 84.0002,
      city_type: "non million",
    },
    {
      id: 23,
      ulb_name: "Jamshedpur NAC",
      latitude: 22.8005,
      longitude: 86.2053,
      city_type: "million plus",
    },
    {
      id: 24,
      ulb_name: "Jamtara Nagar Panchayat",
      latitude: 23.9612,
      longitude: 86.8048,
      city_type: "non million",
    },
    {
      id: 25,
      ulb_name: "Jhumritilaiya Nagar Parishad",
      latitude: 24.4315,
      longitude: 85.531,
      city_type: "non million",
    },
    {
      id: 26,
      ulb_name: "Jugsalai Municipality",
      latitude: 22.7739,
      longitude: 86.1892,
      city_type: "million plus",
    },
    {
      id: 27,
      ulb_name: "Khunti Nagar Panchayat",
      latitude: 23.0581,
      longitude: 85.2847,
      city_type: "non million",
    },
    {
      id: 28,
      ulb_name: "Koderma Nagar Panchayat",
      latitude: 24.476,
      longitude: 85.5937,
      city_type: "non million",
    },
    {
      id: 29,
      ulb_name: "Latehar Nagar Panchayat",
      latitude: 23.7453,
      longitude: 84.4964,
      city_type: "non million",
    },
    {
      id: 30,
      ulb_name: "Lohardaga Nagar Parishad",
      latitude: 23.4416,
      longitude: 84.687,
      city_type: "non million",
    },
    {
      id: 31,
      ulb_name: "Madhupur Nagar Parishad",
      latitude: 24.2659,
      longitude: 86.6467,
      city_type: "non million",
    },
    {
      id: 32,
      ulb_name: "Mango NAC",
      latitude: 22.8282,
      longitude: 86.2116,
      city_type: "million plus",
    },
    {
      id: 33,
      ulb_name: "Manjhiaon Nagar Panchayat",
      latitude: 24.3231,
      longitude: 83.8123,
      city_type: "non million",
    },
    {
      id: 34,
      ulb_name: "Medininagar Nagar Parishad",
      latitude: 24.0392,
      longitude: 84.0697,
      city_type: "non million",
    },
    {
      id: 35,
      ulb_name: "Mihijham Nagar Parishad",
      latitude: 23.8473,
      longitude: 86.8825,
      city_type: "non million",
    },
    {
      id: 36,
      ulb_name: "Nagar Uttari Nagar Panchayat",
      latitude: 24.2845,
      longitude: 83.5017,
      city_type: "non million",
    },
    {
      id: 37,
      ulb_name: "Pakur Nagar Parishad",
      latitude: 24.6377,
      longitude: 87.8353,
      city_type: "non million",
    },
    {
      id: 38,
      ulb_name: "Phusro Nagar Parishad",
      latitude: 23.7635,
      longitude: 86.001,
      city_type: "non million",
    },
    {
      id: 39,
      ulb_name: "Rajmahal Nagar Panchayat",
      latitude: 25.0556,
      longitude: 87.8338,
      city_type: "non million",
    },
    {
      id: 40,
      ulb_name: "Ramgarh Nagar Parishad",
      latitude: 23.6363,
      longitude: 85.5124,
      city_type: "non million",
    },
    {
      id: 42,
      ulb_name: "Sahibganj Nagar Parishad",
      latitude: 25.2425,
      longitude: 87.6322,
      city_type: "non million",
    },
    {
      id: 43,
      ulb_name: "Saraikela Nagar Panchayat",
      latitude: 22.698,
      longitude: 85.9317,
      city_type: "non million",
    },
    {
      id: 44,
      ulb_name: "Simdega Nagar Parishad",
      latitude: 22.6133,
      longitude: 84.5018,
      city_type: "non million",
    },
    {
      id: 45,
      ulb_name: "West Singbhum",
      latitude: 22.3651,
      longitude: 85.4376,
      city_type: "non million",
    },
    {
      id: 46,
      ulb_name: "Bachra Nagar Panchayat",
      latitude: 23.62,
      longitude: 85.48,
      city_type: "non million",
    },
    {
      id: 47,
      ulb_name: "Badakisarai Nagar Panchayat",
      latitude: 24.5,
      longitude: 84.0,
      city_type: "non million",
    },
    {
      id: 48,
      ulb_name: "Dhanwar Nagar Panchayat",
      latitude: 24.4,
      longitude: 85.0,
      city_type: "non million",
    },
    {
      id: 49,
      ulb_name: "Mahagama Nagar Panchayat",
      latitude: 25.0,
      longitude: 87.3,
      city_type: "non million",
    },
    {
      id: 50,
      ulb_name: "Domchach Nagar Panchayat",
      latitude: 24.4745,
      longitude: 85.6803,
      city_type: "non million",
    },
    {
      id: 51,
      ulb_name: "Chattarpur Nagar Panchayat",
      latitude: 24.3,
      longitude: 85.3,
      city_type: "non million",
    },
    {
      id: 52,
      ulb_name: "Hariharganj Nagar Panchayat",
      latitude: 24.542199,
      longitude: 84.279232,
      city_type: "non million",
    },
    {
      id: 53,
      ulb_name: "Barharwa Nagar Panchayat",
      latitude: 24.857778,
      longitude: 87.777167,
      city_type: "non million",
    },
    {
      id: 54,
      ulb_name: "Kapali Nagar Parishad",
      latitude: 22.68,
      longitude: 85.9311,
      city_type: "non million",
    },

    /* ---- NOT IN AUTHORITATIVE LIST ---- */
    {
      id: 55,
      ulb_name: "Ramgarh Cantt",
      latitude: 23.62,
      longitude: 85.48,
      city_type: "non million",
    },
    {
      id: 56,
      ulb_name: "Sri Bansidhar Nagar Panchayat",
      latitude: 24.2,
      longitude: 83.8,
      city_type: "non million",
    },
  ];

  try {
    for (const ulb of ulbData) {
      // Check if the ULB already exists by ID
      const existingUlb = await prisma.ulb.findUnique({
        where: {
          id: ulb.id,
        },
      });

      if (existingUlb) {
        console.log(`ULB with ID ${ulb.id} already exists. Skipping...`);
        continue; // Skip this ULB
      }

      // Insert new data if the ID doesn't exist
      await prisma.ulb.create({
        data: {
          id: ulb.id,
          ulb_name: ulb.ulb_name,
          latitude: ulb.latitude,
          longitude: ulb.longitude,
          city_type: ulb.city_type,
        },
      });

      console.log(`ULB with ID ${ulb.id} created successfully.`);
    }

    console.log("ULBs seeded successfully.");
  } catch (error) {
    console.error("Error seeding ULBs:", error);
  } finally {
    await prisma.$disconnect();
  }
};

seedULBs();
