-- Таблица фильмов
CREATE TABLE films (
    id VARCHAR(36) PRIMARY KEY,
    rating DECIMAL(3,1),
    director VARCHAR(255),
    tags TEXT[],
    title VARCHAR(255),
    about TEXT,
    description TEXT,
    image VARCHAR(255),
    cover VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица расписания
CREATE TABLE schedule (
    id VARCHAR(36) PRIMARY KEY,
    film_id VARCHAR(36) REFERENCES films(id) ON DELETE CASCADE,
    daytime TIMESTAMP WITH TIME ZONE NOT NULL,
    hall INTEGER,
    rows INTEGER,
    seats INTEGER,
    price DECIMAL(10,2),
    taken TEXT[],
    CONSTRAINT valid_hall CHECK (hall >= 0 AND hall <= 2),
    CONSTRAINT valid_price CHECK (price > 0)
);

-- Таблица заказов
CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    film_id VARCHAR(36) REFERENCES films(id),
    session_id VARCHAR(36) REFERENCES schedule(id),
    row INTEGER,
    seat INTEGER,
    price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_seat CHECK (row > 0 AND seat > 0)
);

-- Индексы для ускорения поиска
CREATE INDEX idx_schedule_film_id ON schedule(film_id);
CREATE INDEX idx_schedule_daytime ON schedule(daytime);
CREATE INDEX idx_orders_film_id ON orders(film_id);
CREATE INDEX idx_orders_session_id ON orders(session_id);