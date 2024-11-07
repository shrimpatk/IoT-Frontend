"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Mock data based on the provided structure
const mockData: SensorData = {
  timestamp: Date.now(),
  devices: [
    {
      device_id: "device1",
      last_seen: new Date().toISOString(),
      sensors: {
        environmental: {
          temperature: { value: 22.5, unit: "°C", timestamp: Date.now() },
          humidity: { value: 45, unit: "%", timestamp: Date.now() }
        },
        air_quality: {
          air: { value: 50, unit: "AQI", timestamp: Date.now() },
          co: { value: 0.5, unit: "ppm", timestamp: Date.now() }
        }
      },
      status: {
        online: "true",
        rssi: -65,
        uptime: 3600,
        timestamp: new Date().toISOString()
      },
      room: "Living Room"
    },
    {
      device_id: "device2",
      last_seen: new Date().toISOString(),
      sensors: {
        environmental: {
          temperature: { value: 24, unit: "°C", timestamp: Date.now() },
          humidity: { value: 40, unit: "%", timestamp: Date.now() }
        },
        air_quality: {
          air: { value: 30, unit: "AQI", timestamp: Date.now() },
          co: { value: 0.3, unit: "ppm", timestamp: Date.now() }
        }
      },
      status: {
        online: "true",
        rssi: -70,
        uptime: 7200,
        timestamp: new Date().toISOString()
      },
      room: "Bedroom"
    }
  ]
}

export function SensorDashboardComponent() {
  const [selectedDevice, setSelectedDevice] = useState(mockData.devices[0])

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const chartData = [
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
  ]

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Sensor Dashboard</h1>
      <Tabs defaultValue={selectedDevice.device_id} onValueChange={(value) => setSelectedDevice(mockData.devices.find(d => d.device_id === value) || mockData.devices[0])}>
        <TabsList>
          {mockData.devices.map((device) => (
            <TabsTrigger key={device.device_id} value={device.device_id}>
              {device.room}
            </TabsTrigger>
          ))}
        </TabsList>
        {mockData.devices.map((device) => (
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
                    {device.sensors.air_quality.air.unit}
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
                    {device.sensors.air_quality.co.unit}
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
                      <Badge variant={device.status.online === "true" ? "default" : "destructive"}>
                        {device.status.online === "true" ? "Online" : "Offline"}
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
                      <span>{new Date(device.last_seen).toLocaleString()}</span>
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