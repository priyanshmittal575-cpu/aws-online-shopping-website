CREATE TABLE products (
  id INT PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price INT NOT NULL,
  specs TEXT
);

CREATE TABLE orders (
  order_id VARCHAR(30) PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  total_amount INT NOT NULL,
  items_json TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);