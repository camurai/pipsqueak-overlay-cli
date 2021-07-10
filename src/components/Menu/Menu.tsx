import './Menu.css'

import React, { useCallback } from 'react'
import { useAppData } from '../AppDataProvider'
import { usePhysics } from '../PhysicsProvider'
import Toggle from '../Toggle'

const Menu: React.FC<{ className?: string }> = ({ className }) => {
	const { addAvatar, addFirework, setIsGreenScreen } = useAppData()
	const { width, height, cleanup } = usePhysics()

	const spawnSquid = useCallback(() => {
		addAvatar({ name: 'another one' })
	}, [addAvatar])
	const spawnCeilingSquid = useCallback(() => {
		addAvatar({ name: 'another one', force: 3 })
	}, [addAvatar])
	const spawnFirework = useCallback(() => {
		addFirework({
			name: 'another firework',
			x: Math.round(width * Math.random()),
			y: Math.round(Math.random() * (height - 300)),
		})
	}, [addFirework, width, height])

	const toggleGreenScreen = useCallback(
		(value) => {
			if (setIsGreenScreen) setIsGreenScreen(value)
		},
		[setIsGreenScreen]
	)

	return (
		<div data-test="Menu" className={`Menu ${className || ''}`} style={{ width, height }}>
			<div className="window">
				<button type="button" onClick={spawnSquid}>
					Squid
				</button>
				<button type="button" onClick={spawnCeilingSquid}>
					Ceiling Squid
				</button>
				<button type="button" onClick={spawnFirework}>
					Spawn Firework
				</button>
				<button type="button" onClick={cleanup}>
					Clear Frame
				</button>
				<Toggle text="Green Screen" onToggle={toggleGreenScreen} />
			</div>
		</div>
	)
}

export default Menu
