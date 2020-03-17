const { createUsers } = require('./user');

async function seedDatabase() {
  // Create users
  await createUsers();
  return 'Seed complete';
}

seedDatabase().then(console.log);
