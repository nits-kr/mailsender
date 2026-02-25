require("dotenv").config();
console.log("PORT:", process.env.PORT);
console.log("MYSQL_HOST:", process.env.MYSQL_HOST);
console.log("MYSQL_USER:", process.env.MYSQL_USER);
console.log("MONGODB_URI_EXISTS:", !!process.env.MONGODB_URI);
