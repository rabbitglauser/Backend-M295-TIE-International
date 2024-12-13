CREATE TABLE public.users (
    id serial NOT NULL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(512) NOT NULL,
    salt VARCHAR(512) NOT NULL,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    postcode VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    documents_filename VARCHAR(511) NOT NULL,
    date_of_birth DATE NOT NULL,
    registration_time TIMESTAMP NOT NULL,
    email_confirmed BOOLEAN NOT NULL,
    identity_confirmed BOOLEAN NOT NULL
);