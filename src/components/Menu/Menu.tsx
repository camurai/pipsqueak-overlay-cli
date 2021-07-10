import './Menu.css'

import React, { useCallback, useState } from 'react'
import { Composite } from 'matter-js'
import { useAppData } from '../AppDataProvider'
import { usePhysics } from '../PhysicsProvider'
import Toggle from '../Toggle'

const Menu: React.FC<{ className?: string }> = ({ className }) => {
	const { addAvatar, addFirework, setIsGreenScreen } = useAppData()
	const { width, height, cleanup, engine } = usePhysics()
	const [isGravityOn, setIsGravityOn] = useState(true)

	const checkOverfill = useCallback(() => {
		if (engine?.current?.world) {
			const allBodies = Composite.allBodies(engine.current.world)
			if (allBodies.length > 630) return true
		}
		return false
	}, [engine])

	const spawnSquid = useCallback(() => {
		let force = 1
		if (!isGravityOn) force = 0.5
		if (checkOverfill()) setTimeout(spawnSquid, 1000)
		else addAvatar({ name: 'another one', force })
	}, [addAvatar, checkOverfill, isGravityOn])

	const spawnCeilingSquid = useCallback(() => {
		addAvatar({ name: 'another one', force: 3 })
	}, [addAvatar])
	const spawnFirework = useCallback(() => {
		if (checkOverfill()) setTimeout(spawnFirework, 1000)
		else
			addFirework({
				name: 'another firework',
				x: Math.round(width * Math.random()),
				y: Math.round(Math.random() * (height - 300)),
			})
	}, [addFirework, checkOverfill, width, height])

	const toggleGreenScreen = useCallback(
		(value) => {
			if (setIsGreenScreen) setIsGreenScreen(value)
		},
		[setIsGreenScreen]
	)

	const toggleSpaceMode = useCallback(
		(value) => {
			if (engine?.current) {
				setIsGravityOn((oldIsGravityOn) => {
					return !oldIsGravityOn
				})
				if (engine.current.gravity.scale === 0.001) engine.current.gravity.scale = 0.00005
				else engine.current.gravity.scale = 0.001
			}
		},
		[engine]
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
					Cleanup
				</button>
				<Toggle text="Green Screen" onToggle={toggleGreenScreen} />
				<Toggle text="Space Mode" onToggle={toggleSpaceMode} startValue={false} />
			</div>
		</div>
	)
}

export default Menu
