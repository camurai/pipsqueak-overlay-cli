import './App.css'

import React from 'react'
import AppDataProvider from '../AppDataProvider'
import Squids from '../Squids'
import Menu from '../Menu'
import { PhysicsProvider } from '../PhysicsProvider'

const App: React.FC<{ className?: string }> = ({ className }) => {
	return (
		<div data-test="App" className={`App ${className || ''}`}>
			<AppDataProvider>
				<PhysicsProvider>
					<Squids />
					<Menu />
				</PhysicsProvider>
			</AppDataProvider>
		</div>
	)
}

export default App
