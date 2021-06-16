import './App.css'

import React from 'react'

const App: React.FC<{ className?: string }> = ({ className }) => {
	return (
		<div
			data-test='App'
			className={`App ${className || ''}`}
		>
			<header className="App-header">
				<p>
					Edit <code>src/domains/App/App.tsx</code> and save to reload.
        </p>
				<a
					className="App-link"
					href="https://reactjs.org"
					target="_blank"
					rel="noopener noreferrer"
				>
					Learn React
        </a>
			</header>

		</div>
	)
}

export default App
