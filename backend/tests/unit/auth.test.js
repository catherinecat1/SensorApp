const jwt = require('jsonwebtoken');
const authenticateToken = require('../../src/middleware/auth');

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockRequest;
  let mockResponse;
  let nextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      sendStatus: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should return 401 if no token is provided', () => {
    authenticateToken(mockRequest, mockResponse, nextFunction);
    expect(mockResponse.sendStatus).toHaveBeenCalledWith(401);
  });

  it('should call next() if token is valid', () => {
    mockRequest.headers['authorization'] = 'Bearer valid_token';
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, { username: 'testuser' });
    });

    authenticateToken(mockRequest, mockResponse, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest.user).toEqual({ username: 'testuser' });
  });

  it('should return 403 if token is invalid', () => {
    mockRequest.headers['authorization'] = 'Bearer invalid_token';
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(new Error('Invalid token'), null);
    });

    authenticateToken(mockRequest, mockResponse, nextFunction);
    expect(mockResponse.sendStatus).toHaveBeenCalledWith(403);
  });
});