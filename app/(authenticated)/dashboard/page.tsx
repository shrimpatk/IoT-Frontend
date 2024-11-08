'use client'

import { useState, useEffect } from 'react'
import { gql, useMutation, useSubscription, useQuery } from '@apollo/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { AlertCircle, WifiOff } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

const SENSOR_DATA = gql`
    subscription SensorRead {
        sensorsRead {
            timestamp
            devices {
                device_id
                last_seen
                room
                sensors {
                    environmental {
                        temperature {
                            value
                            unit
                            timestamp
                        }
                        humidity {
                            value
                            unit
                            timestamp
                        }
                    }
                    air_quality {
                        air {
                            value
                            unit
                            timestamp
                        }
                        co {
                            value
                            unit
                            timestamp
                        }
                    }
                }
                status {
                    online
                    rssi
                    uptime
                    timestamp
                }
            }
        }
    }
`

const UPDATE_THROTTLE = gql`
    mutation UpdateThrottleTime($time: Int!) {
        updateThrottleTime(time: $time)
    }
`;

const GET_THROTTLE = gql`
    query getThrottleTime {
        getThrottleTime
    }
`

const LoadingSkeleton = () => (
  <div className="container mx-auto p-4">
    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4"/>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-4 w-24 bg-gray-200 rounded"/>
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-gray-200 rounded"/>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="container mx-auto p-4">
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {message}
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
        >
          Try Again
        </button>
      </AlertDescription>
    </Alert>
  </div>
)

const NoDataDisplay = () => (
  <div className="container mx-auto p-4">
    <Alert>
      <WifiOff className="h-4 w-4" />
      <AlertTitle>No Data Available</AlertTitle>
      <AlertDescription>
        No sensor data is currently available. This might be due to connection issues or sensor downtime.
      </AlertDescription>
    </Alert>
  </div>
)

const validateSensorData = (data: any) => {
  if (!data?.devices?.length) return false;

  return data.devices.every((device: any) => {
    const temp = device.sensors?.environmental?.temperature;
    const humidity = device.sensors?.environmental?.humidity;

    return (
      temp?.value != null &&
      humidity?.value != null &&
      temp.value >= -50 && temp.value <= 100 && // reasonable temperature range
      humidity.value >= 0 && humidity.value <= 100 // humidity percentage
    );
  });
}

export default function SensorDashboard() {
  const [sensorsData, setSensorsData] = useState(null)
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [lastValidData, setLastValidData] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('connecting')
  const [currentThrottle, setCurrentThrottle] = useState('2000');

  const { data: throttleData } = useQuery(GET_THROTTLE);
  const [updateThrottle] = useMutation(UPDATE_THROTTLE)
  const { data, loading, error } = useSubscription(SENSOR_DATA, {
    onError: (error) => {
      console.error('Subscription error: ', error)
      setConnectionStatus('error')
    },
    onData: ({ data }) => {
      if (validateSensorData(data.sensorsRead)) {
        setSensorsData(data.sensorsRead);
        setLastValidData(data.sensorsRead);
        setConnectionStatus('connected');
      } else {
        console.warn('Received invalid sensor data');
        // Keep showing last valid data if available
        if (lastValidData) {
          setSensorsData(lastValidData);
        }
      }
    }
  });

  useEffect(() => {
    if (data) {
      setSensorsData(data.sensorsRead)
      if (!selectedDevice && data.sensorsRead.devices.length > 0) {
        setSelectedDevice(data.sensorsRead.devices[0])
      }
    }
  }, [data, selectedDevice])

  useEffect(() => {
    if (throttleData?.getThrottleTime) {
      setCurrentThrottle(String(throttleData.getThrottleTime));
    }
  }, [throttleData]);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorDisplay message={error.message}/>
  if (!sensorsData) return <NoDataDisplay />

  const chartData = selectedDevice ? [
    {
      name: 'Temperature',
      value: selectedDevice.sensors.environmental.temperature.value,
      unit: selectedDevice.sensors.environmental.temperature.unit,
    },
    {
      name: 'Humidity',
      value: selectedDevice.sensors.environmental.humidity.value,
      unit: selectedDevice.sensors.environmental.humidity.unit,
    },
    {
      name: 'Air Quality',
      value: selectedDevice.sensors.air_quality.air.value,
      unit: selectedDevice.sensors.air_quality.air.unit,
    },
    {
      name: 'CO',
      value: selectedDevice.sensors.air_quality.co.value,
      unit: selectedDevice.sensors.air_quality.co.unit,
    },
  ] : []

  const handleThrottleChange = async (newTime: number) => {
    try {
      await updateThrottle({
        variables: {
          time: newTime
        }
      })
    } catch (e) {
      console.error('Failed to update throttle:', e);
    }
  }

  return (
    <div className="container mx-auto p-4">
      {connectionStatus === 'error' && (
        <Alert className="mb-4" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            There was an error connecting to the sensor network. Data might be stale.
          </AlertDescription>
        </Alert>
      )}

      <h1 className="text-3xl font-bold mb-4">Sensor Dashboard</h1>
      <Tabs
        value={selectedDevice?.device_id}
        onValueChange={(value) => setSelectedDevice(sensorsData.devices.find(d => d.device_id === value))}
      >
        <TabsList>
          {sensorsData.devices.map((device) => (
            <TabsTrigger key={device.device_id} value={device.device_id}>
              {device.room}
            </TabsTrigger>
          ))}
        </TabsList>
        {sensorsData.devices.map((device) => (
          <TabsContent key={device.device_id} value={device.device_id}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle>Temperature</CardTitle>
                  <CardDescription>Current room temperature</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {device.sensors.environmental.temperature.value}
                    {device.sensors.environmental.temperature.unit}
                  </div>
                  <div className="text-xs font-bold">
                    {new Date(device.sensors.environmental.temperature.timestamp).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Humidity</CardTitle>
                  <CardDescription>Current room humidity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {device.sensors.environmental.humidity.value}
                    {device.sensors.environmental.humidity.unit}
                  </div>
                  <div className="text-xs font-bold">
                    {new Date(device.sensors.environmental.humidity.timestamp).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Air Quality</CardTitle>
                  <CardDescription>Current air quality index</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {device.sensors.air_quality.air.value}
                  </div>
                  <div className="text-xs font-bold">
                    {new Date(device.sensors.air_quality.air.timestamp).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>CO Level</CardTitle>
                  <CardDescription>Current carbon monoxide level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {device.sensors.air_quality.co.value}
                  </div>
                  <div className="text-xs font-bold">
                    {new Date(device.sensors.air_quality.co.timestamp).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Device Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant={device.status.online === 'online' ? 'default' : 'destructive'}>
                        {device.status.online.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Signal Strength:</span>
                      <span>{device.status.rssi} dBm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uptime:</span>
                      <span>{formatUptime(device.status.uptime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Seen:</span>
                      <span>{new Date(sensorsData.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Sensor Readings</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
      <Select value={currentThrottle} onValueChange={async (value) => {
        setCurrentThrottle(value);
        await handleThrottleChange(Number(value));
      }}>
        <SelectTrigger className="mt-4 w-[180px] font-bold text-xs">
          <SelectValue placeholder="Throttle Rate" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1000">Throttle Rate: 1s</SelectItem>
          <SelectItem value="2000">Throttle Rate: 2s</SelectItem>
          <SelectItem value="3000">Throttle Rate: 3s</SelectItem>
          <SelectItem value="5000">Throttle Rate: 5s</SelectItem>
          <SelectItem value="10000">Throttle Rate: 10s</SelectItem>
          <SelectItem value="15000">Throttle Rate: 15s</SelectItem>
          <SelectItem value="30000">Throttle Rate: 30s</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}