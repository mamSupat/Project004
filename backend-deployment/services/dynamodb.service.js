import { QueryCommand, GetItemCommand, PutItemCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb } from '../config/dynamodb.js';

// ==================== GET: Sensor Data by DeviceId ====================
export const getSensorData = async (deviceId, limit = 20) => {
  try {
    const command = new QueryCommand({
      TableName: 'SensorData',
      KeyConditionExpression: 'deviceId = :deviceId',
      ExpressionAttributeValues: {
        ':deviceId': deviceId,
      },
      ScanIndexForward: false, // เรียงจากใหม่ไปเก่า
      Limit: limit,
    });

    const response = await dynamoDb.send(command);
    return response.Items || [];
  } catch (error) {
    console.error('❌ DynamoDB getSensorData error:', error);
    throw error;
  }
};

// ==================== GET: Device Status ====================
export const getDeviceStatus = async (deviceId) => {
  try {
    const command = new GetItemCommand({
      TableName: 'DeviceStatus',
      Key: {
        deviceId: deviceId,
      },
    });

    const response = await dynamoDb.send(command);
    return response.Item || null;
  } catch (error) {
    console.error('❌ DynamoDB getDeviceStatus error:', error);
    throw error;
  }
};

// ==================== PUT: Save Sensor Data ====================
export const saveSensorData = async (data) => {
  try {
    const command = new PutItemCommand({
      TableName: 'SensorData',
      Item: {
        deviceId: data.deviceId,
        timestamp: Date.now(),
        temperature: data.temperature,
        humidity: data.humidity,
        ...data,
      },
    });

    await dynamoDb.send(command);
    return { success: true, message: 'Data saved to DynamoDB' };
  } catch (error) {
    console.error('❌ DynamoDB saveSensorData error:', error);
    throw error;
  }
};

// ==================== PUT: Update Device Status ====================
export const updateDeviceStatus = async (deviceId, status) => {
  try {
    const command = new PutItemCommand({
      TableName: 'DeviceStatus',
      Item: {
        deviceId: deviceId,
        status: status,
        lastUpdate: new Date().toISOString(),
        timestamp: Date.now(),
      },
    });

    await dynamoDb.send(command);
    return { success: true, deviceId, status };
  } catch (error) {
    console.error('❌ DynamoDB updateDeviceStatus error:', error);
    throw error;
  }
};

// ==================== GET: All Devices Status ====================
export const getAllDevicesStatus = async () => {
  try {
    const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
    const command = new ScanCommand({
      TableName: 'DeviceStatus',
    });

    const response = await dynamoDb.send(command);
    return response.Items || [];
  } catch (error) {
    console.error('❌ DynamoDB getAllDevicesStatus error:', error);
    throw error;
  }
};
