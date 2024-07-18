-- Create iot_devices table
CREATE TABLE IF NOT EXISTS iot_devices (
    id SERIAL PRIMARY KEY,
    equipment_id VARCHAR(50) UNIQUE NOT NULL,
    secret_key VARCHAR(255) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    latitude DECIMAL(8,6) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on equipment_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_iot_devices_equipment_id ON iot_devices(equipment_id);

-- Create sensor_data table
CREATE TABLE IF NOT EXISTS sensor_data (
    id SERIAL PRIMARY KEY,
    equipment_id VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_sensor_data_equipment_id ON sensor_data(equipment_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_timestamp ON sensor_data(timestamp);

-- Create a unique constraint on equipment_id and timestamp
-- This ensures that we don't have duplicate readings for the same equipment at the same time
ALTER TABLE sensor_data ADD CONSTRAINT unique_equipment_timestamp UNIQUE (equipment_id, timestamp);

-- Add foreign key constraint to ensure data integrity
ALTER TABLE sensor_data
ADD CONSTRAINT fk_sensor_data_equipment
FOREIGN KEY (equipment_id) 
REFERENCES iot_devices(equipment_id)
ON DELETE CASCADE;
