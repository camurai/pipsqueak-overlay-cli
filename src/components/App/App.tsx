import './App.css'

import React from 'react'
import AppDataProvider from '../AppDataProvider'
import Squids from '../Squids'
import Menu from '../Menu'

const App: React.FC<{ className?: string }> = ({ className }) => {
	return (
		<div data-test="App" className={`App ${className || ''}`}>
			<AppDataProvider>
				<Squids />
				<Menu />
			</AppDataProvider>
		</div>
	)
}

export default App
