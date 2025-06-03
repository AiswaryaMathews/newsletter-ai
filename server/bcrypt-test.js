const bcrypt = require('bcryptjs');

async function testPassword() {
  const plainPassword = 'admin123'; // Replace with the password you want to test
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  
  console.log('Hashed:', hashedPassword);

  const match = await bcrypt.compare(plainPassword, hashedPassword);
  console.log('Match:', match); // should print true
}

testPassword();
