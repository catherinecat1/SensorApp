const SensorData = require('../../src/models/sensorData');
const db = require('../../src/config/database');
const redis = require('../../src/config/redis');

jest.mock('../../src/config/database');
jest.mock('../../src/config/redis');

describe('SensorData Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('insert', () => {
    it('should insert sensor data and invalidate cache', async () => {
      db.query.mockResolvedValue({ rows: [{ id: 1 }] });
      redis.del.mockResolvedValue(1);

      await SensorData.insert('EQ001', '2023-07-17T00:00:00Z', 50);

      expect(db.query).toHaveBeenCalled();
    });
  });

  describe('getAverageData', () => {
    it('should return cached data if available', async () => {
      const mockData = [{ hours: '2023-07-17T00:00:00Z', average: 50 }];
      redis.get.mockResolvedValue(JSON.stringify(mockData));

      const result = await SensorData.getAverageData(24);

      expect(redis.get).toHaveBeenCalled();
      expect(db.query).not.toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it('should query database and cache result if no cached data', async () => {
      const mockData = [{ hours: '2023-07-17T00:00:00Z', average: 50 }];
      redis.get.mockResolvedValue(null);
      db.query.mockResolvedValue({ rows: mockData });

      const result = await SensorData.getAverageData(24);

      expect(redis.get).toHaveBeenCalled();
      expect(db.query).toHaveBeenCalled();
      expect(redis.set).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('getDataByEquipment', () => {
    it('should return data for specific equipment and time range', async () => {
      const mockData = [{ timestamp: '2023-07-17T00:00:00Z', value: 50 }];
      db.query.mockResolvedValue({ rows: mockData });
  
      const result = await SensorData.getDataByEquipment('EQ001', '2023-07-16T00:00:00Z', '2023-07-18T00:00:00Z');
  
      expect(db.query).toHaveBeenCalledWith(expect.any(String), ['EQ001', '2023-07-16T00:00:00Z', '2023-07-18T00:00:00Z']);
      expect(result).toEqual(mockData);
    });
  });
  
  describe('getLatestSensorData', () => {
    it('should return latest sensor data', async () => {
      const mockData = [{ equipment_id: 'EQ001', timestamp: '2023-07-17T00:00:00Z', value: 50 }];
      redis.get.mockResolvedValue(null);
      db.query.mockResolvedValue({ rows: mockData });
  
      const result = await SensorData.getLatestSensorData(24, 'EQ001');
  
      expect(db.query).toHaveBeenCalled();
      expect(redis.set).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });
  
  describe('getLatestSensorDatabyLocation', () => {
    it('should return latest sensor data grouped by location', async () => {
      const mockData = [{ equipment_id: 'EQ001', longitude: 0, latitude: 0, value: 50 }];
      redis.get.mockResolvedValue(null);
      db.query.mockResolvedValue({ rows: mockData });
  
      const result = await SensorData.getLatestSensorDatabyLocation(24);
  
      expect(db.query).toHaveBeenCalled();
      expect(redis.set).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });
  
  describe('batchInsert', () => {
    it('should insert multiple sensor data records', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn()
      };
      db.getClient.mockResolvedValue(mockClient);
  
      const data = [
        { equipmentId: 'EQ001', timestamp: '2023-07-17T00:00:00Z', value: 50 },
        { equipmentId: 'EQ002', timestamp: '2023-07-17T00:00:00Z', value: 60 }
      ];
  
      await SensorData.batchInsert(data);
  
      expect(mockClient.query).toHaveBeenCalledTimes(4); // BEGIN, 2 inserts, COMMIT
      expect(mockClient.release).toHaveBeenCalled();
    });
  
    it('should rollback transaction on error', async () => {
      const mockClient = {
        query: jest.fn().mockRejectedValueOnce(new Error('Database error')),
        release: jest.fn()
      };
      db.getClient.mockResolvedValue(mockClient);
  
      const data = [
        { equipmentId: 'EQ001', timestamp: '2023-07-17T00:00:00Z', value: 50 }
      ];
  
      await expect(SensorData.batchInsert(data)).rejects.toThrow('Database error');
  
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

})