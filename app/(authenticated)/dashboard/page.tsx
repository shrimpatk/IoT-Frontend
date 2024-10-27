'use client'

import { gql, useQuery, useSubscription } from '@apollo/client';
import { Loader } from 'lucide-react';
import StaticTextDashboard from './StaticTextDashboard';
import { useEffect, useState } from 'react';

const SENSOR_DATA = gql`
    subscription SensorUpdate {
        sensorsRead {
            measurement
            tags {
                deviceId
                model
                sensorType
                floor
            }
            fields {
                temperature
                humidity
            }
            timestamp
        }
    }
`;

const GET_USER_BY_ID = gql`
    query GetUser {
        getUserById(id: "241a39de-9935-4672-974e-7a3e477cd260") {
            username
        }
    }
`

export default function DashboardPage() {
  const [sensorsData, setSensorsData] = useState(null);
  const { data: userData, loading: userLoading, error: userError } = useQuery(GET_USER_BY_ID);
  const  { data, loading, error } = useSubscription(SENSOR_DATA)

  useEffect(() => {
    if (data) {
      console.log(data)
      setSensorsData(data.sensorsRead[0]);
    }
  }, [data])

  if (loading) return <Loader />;
  if (error) {
    console.error('Subscription error:', error);
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <p>{userData?.getUserById?.username || 'Loading...'}</p>
      {sensorsData ? (
        <>
          <StaticTextDashboard
            title="Temperature"
            value={`${sensorsData.fields.temperature}°C`}
            time={`${sensorsData.timestamp}`}
          />
          <StaticTextDashboard
            title="Humidity"
            value={`${sensorsData.fields.humidity}%`}
            time={`${sensorsData.timestamp}`}
          />
        </>
      ) : (
        <div>Waiting for sensor data...</div>
      )}
    </div>
  );
}