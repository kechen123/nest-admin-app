const bcrypt = require("bcrypt");

const hash = "$2b$10$CyOrL4KfwIoJGYbFoVAPguVvhakw3jHnoNuZA2YxoRXsCl5LzrDN2";
const password = "admin123";

bcrypt.compare(password, hash).then((result) => {
  console.log("Password verification:", result ? "SUCCESS ✓" : "FAILED ✗");
  process.exit(result ? 0 : 1);
});
