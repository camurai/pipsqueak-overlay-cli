import './App.css'

import React from 'react'
import AppDataProvider from '../AppDataProvider'
import PhysicsObjects from '../PhysicsObjects'
import Menu from '../Menu'
import { PhysicsProvider } from '../PhysicsProvider'

const App: React.FC<{ className?: string }> = ({ className }) => {
	return (
		<div data-test="App" className={`App ${className || ''}`}>
			<AppDataProvider>
				<PhysicsProvider>
					<PhysicsObjects />
					<Menu />
				</PhysicsProvider>
			</AppDataProvider>
		</div>
	)
}

export default App
