import { useEffect, useRef, useState } from 'react'
import { useQuery, gql, useSubscription } from '@apollo/client';
import './App.css'

const GET_LOCATIONS = gql`
  query GetLocations {
    locations {
      id
      name
      description
      photo
    }
  }
`;


function App() {
  const { subscribeToMore } = useQuery(GET_LOCATIONS);

  useEffect(() => {
    console.log("mount")
    return () => console.log("dismount")
  }, [])

  console.log("render")

  return <p className="text-lg">hello</p>
}

export default App
