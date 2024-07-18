const IoTDevice = require('../../src/models/iotDevice');
const db = require('../../src/config/database');
const bcrypt = require('bcrypt');

jest.mock('../../src/config/database');
jest.mock('bcrypt');

describe('IoTDevice Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new IoT device', async () => {
      const mockDevice = { equipment_id: 'EQ001', secret_key: 'hashedSecret', longitude: 0, latitude: 0 };
      db.query.mockResolvedValue({ rows: [mockDevice] });
      bcrypt.hash.mockResolvedValue('hashedSecret');

      const result = await IoTDevice.create('EQ001', 'secret', 0, 0);

      expect(bcrypt.hash).toHaveBeenCalledWith('secret', 10);
      expect(db.query).toHaveBeenCalled();
      expect(result).toEqual(mockDevice);
    });
  });

  describe('verify', () => {
    it('should return true for valid credentials', async () => {
      db.query.mockResolvedValue({ rows: [{ secret_key: 'hashedSecret' }] });
      bcrypt.compare.mockResolvedValue(true);

      const result = await IoTDevice.verify('EQ001', 'secret');

      expect(db.query).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith('secret', 'hashedSecret');
      expect(result).toBe(true);
    });

    it('should return false for invalid equipment ID', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await IoTDevice.verify('InvalidEQ', 'secret');

      expect(result).toBe(false);
    });
  });

  describe('getAll', () => {
    it('should return all IoT devices', async () => {
      const mockDevices = [
        { equipment_id: 'EQ001', longitude: 0, latitude: 0 },
        { equipment_id: 'EQ002', longitude: 1, latitude: 1 }
      ];
      db.query.mockResolvedValue({ rows: mockDevices });
  
      const result = await IoTDevice.getAll();
  
      expect(db.query).toHaveBeenCalled();
      expect(result).toEqual(mockDevices);
    });
  });
  
  describe('getById', () => {
    it('should return a specific IoT device', async () => {
      const mockDevice = { equipment_id: 'EQ001', longitude: 0, latitude: 0 };
      db.query.mockResolvedValue({ rows: [mockDevice] });
  
      const result = await IoTDevice.getById('EQ001');
  
      expect(db.query).toHaveBeenCalledWith(expect.any(String), ['EQ001']);
      expect(result).toEqual(mockDevice);
    });
  
    it('should return undefined for non-existent device', async () => {
      db.query.mockResolvedValue({ rows: [] });
  
      const result = await IoTDevice.getById('NonExistent');
  
      expect(result).toBeUndefined();
    });
  });

})