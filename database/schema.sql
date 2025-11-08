-- Table: public.patient_details

-- DROP TABLE IF EXISTS public.patient_details;

CREATE TABLE IF NOT EXISTS public.patient_details
(
    fullname character varying(100) COLLATE pg_catalog."default",
    age integer,
    gender character varying(10) COLLATE pg_catalog."default",
    height_cm character varying(20) COLLATE pg_catalog."default",
    weight_in_kg character varying(10) COLLATE pg_catalog."default",
    address character varying(200) COLLATE pg_catalog."default",
    user_id character varying(200) COLLATE pg_catalog."default" NOT NULL,
    phone character varying(20) COLLATE pg_catalog."default",
    CONSTRAINT patient_details_pkey PRIMARY KEY (user_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.patient_details
    OWNER to admin;


-- Table: public.users

-- DROP TABLE IF EXISTS public.users;

CREATE TABLE IF NOT EXISTS public.users
(
    email character varying(50) COLLATE pg_catalog."default" NOT NULL,
    password character varying(200) COLLATE pg_catalog."default",
    role integer NOT NULL,
    id character varying(200) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to admin;