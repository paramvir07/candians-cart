import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function createImmigrationUser() {
  const { dbConnect } = await import("@/db/dbConnect");
  const { auth } = await import("@/lib/auth/auth");

  await dbConnect();

  const email = "immigration@example.com";
  const password = "Immigration@12345";

  const newImmigrationUser = await auth.api.createUser({
    body: {
      name: "Immigration User",
      email,
      password,
      role: "immigration",
    },
  });

  if (!newImmigrationUser?.user?.id) {
    throw new Error("Better Auth user was not created");
  }

  console.log("Immigration user created successfully");
  console.log("User ID:", newImmigrationUser.user.id);
  console.log("Email:", email);
  console.log("Password:", password);
}

createImmigrationUser()
  .then(() => {
    console.log("Done");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });
