import './PhysicsObjects.css'

import React from 'react'
import { useAppData } from '../AppDataProvider'
import Squid from '../Squid'
import Splash from '../Splash'
import Firework from '../Firework'

const PhysicsObjects: React.FC<{ className?: string }> = ({ className }) => {
	const { avatars, splashs, fireworks } = useAppData()
	return (
		<div data-test="PhysicsObjects" className={`PhysicsObjects ${className || ''}`}>
			{avatars.map(({ id, force }) => (
				<Squid key={id} id={id || 0} force={force} />
			))}
			{splashs.map(({ id, x, y }) => (
				<Splash key={id} id={id || 0} x={x} y={y} />
			))}
			{fireworks.map(({ id, x, y }) => (
				<Firework key={id} id={id || 0} x={x} y={y} />
			))}
		</div>
	)
}

export default PhysicsObjects
