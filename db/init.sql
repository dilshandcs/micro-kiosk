DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS verification_codes;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  mobile VARCHAR(20) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE verification_codes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('mobile_verification', 'password_reset')),
  expires_at TIMESTAMP NOT NULL,
  consumed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (mobile, password, is_verified) VALUES ('0771234567', '$2b$10$p54NSSxkOOJrJB.yYiVm2O66idasetPaUHw7.qr42nZ.AEsECfLQy', TRUE); 
INSERT INTO users (mobile, password, is_verified) VALUES ('0701234567', '$2b$10$p54NSSxkOOJrJB.yYiVm2O66idasetPaUHw7.qr42nZ.AEsECfLQy', FALSE);
INSERT INTO verification_codes (user_id, code, type, expires_at, consumed) VALUES 
(1, '123456', 'mobile_verification', NOW() + INTERVAL '1 day', TRUE),
(1, '654321', 'password_reset', NOW() + INTERVAL '1 day', FALSE),
(2, '123456', 'mobile_verification', NOW() + INTERVAL '1 day', FALSE);