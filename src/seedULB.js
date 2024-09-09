const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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

async function main() {
  // Insert ULB names into ULBMaster table and store the results
  const ulbMasters = await Promise.all(
    ulbNames.map((name) =>
      prisma.uLBMaster.create({
        data: { name, latitude: 0.0, longitude: 0.0 }, // Default values for latitude and longitude
      })
    )
  );

  console.log("ULBMaster names inserted");

  // Insert ULBs using the ids from ULBMaster
  for (const ulbMaster of ulbMasters) {
    await prisma.uLB.create({
      data: {
        ulb_id: ulbMaster.id,
        name: ulbMaster.name,
        latitude: ulbMaster.latitude,
        longitude: ulbMaster.longitude,
      },
    });
  }

  console.log("ULB names inserted");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
