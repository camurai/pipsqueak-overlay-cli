import './App.css'

import React from 'react'
import PhysicsRender from '../PhysicsRender'
import AppDataProvider from '../AppDataProvider'

const App: React.FC<{ className?: string }> = ({ className }) => {
	return (
		<div data-test="App" className={`App ${className || ''}`}>
			<AppDataProvider>
				<PhysicsRender />
			</AppDataProvider>
		</div>
	)
}

export default App
