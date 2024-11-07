'use client'

import { useState, useEffect } from 'react'
import { gql, useSubscription } from '@apollo/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Loader } from 'lucide-react'

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

export default function SensorDashboard() {
  const [sensorsData, setSensorsData] = useState(null)
  const [selectedDevice, setSelectedDevice] = useState(null)
  const { data, loading, error } = useSubscription(SENSOR_DATA)

  useEffect(() => {
    if (data) {
      setSensorsData(data.sensorsRead)
      if (!selectedDevice && data.sensorsRead.devices.length > 0) {
        setSelectedDevice(data.sensorsRead.devices[0])
      }
    }
  }, [data, selectedDevice])

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="w-8 h-8 animate-spin" /></div>
  if (error) return <div className="text-red-500">Error: {error.message}</div>
  if (!sensorsData) return null

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

  return (
    <div className="container mx-auto p-4">
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
                      <Badge variant={device.status.online === "online" ? "default" : "destructive"}>
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
    </div>
  )
}