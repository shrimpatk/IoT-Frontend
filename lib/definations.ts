export interface SensorFields {
  temperature: number;
  humidity:    number;
}

export interface SensorTags {
  deviceId:   string;
  floor:      string;
  model:      string;
  room:       string;
  sensorType: string
}

export interface SensorData {
  measurement: string;
  fields: SensorFields;
  tags: SensorTags;
  timestamp: Date;
}