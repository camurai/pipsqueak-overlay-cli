import './Squids.css'

import React from 'react'
import { useAppData } from '../AppDataProvider'
import Squid from '../Squid'
import Splash from '../Splash'

const Squids: React.FC<{ className?: string }> = ({ className }) => {
	const { avatars, splashs } = useAppData()
	return (
		<div data-test="Squids" className={`Squids ${className || ''}`}>
			{avatars.map(({ id }) => (
				<Squid key={id} id={id || 0} />
			))}
			{splashs.map(({ id, x, y }) => (
				<Splash key={id} id={id || 0} x={x} y={y} />
			))}
		</div>
	)
}

export default Squids
