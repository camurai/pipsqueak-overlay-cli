import './Menu.css'

import React, { useCallback, useState } from 'react'
import { Composite, Vector } from 'matter-js'
import { Avatar, useAppData } from '../AppDataProvider'
import { usePhysics } from '../PhysicsProvider'
import Toggle from '../Toggle'

const Menu: React.FC<{ className?: string }> = ({ className }) => {
	const { addAvatar, addFirework, setIsGreenScreen } = useAppData()
	const { width, height, cleanup, engine } = usePhysics()
	const [isGravityOn, setIsGravityOn] = useState(true)
	const spawnPileX = 1100
	const pileVector = Vector.rotate(Vector.create(0, -1), (23 * Math.PI) / 180)

	const checkOverfill = useCallback(() => {
		if (engine?.current?.world) {
			const allBodies = Composite.allBodies(engine.current.world)
			if (allBodies.length > 630) return true
		}
		return false
	}, [engine])

	const spawnSquid = useCallback((spawnSettings: Partial<Avatar> = {}) => {
		let force = 1
		if (!isGravityOn) force = 0.5
		if (checkOverfill()) setTimeout(() => spawnSquid(spawnSettings), 1000)
		else addAvatar({ name: 'squidy', force, ...spawnSettings })
	}, [])

	const spawnRandomSquid = useCallback(() => {
		let force = 1
		if (!isGravityOn) force = 0.5
		spawnSquid({ force })
	}, [spawnSquid, isGravityOn])

	const spawnSquidPile = useCallback(() => {
		// let force = 1
		// if (!isGravityOn) force = 0.5
		const squidCount = 10
		for (let i = 0; i < squidCount - 1; i++)
			setTimeout(
				() =>
					spawnSquid({
						spawnX: spawnPileX + Math.random() * 200 - 100,
						vectorX: pileVector.x,
						vectorY: pileVector.y,
						torque: 10,
					}),
				500 * i
			)
		/* if (checkOverfill()) setTimeout(spawnSquidPile, 1000)
		else
			addAvatar({
				name: 'squidy',
				force,
				spawnX: spawnPileX,
				vectorX: pileVector.x,
				vectorY: pileVector.y,
			}) */
	}, [addAvatar, checkOverfill, isGravityOn, pileVector.x, pileVector.y, spawnPileX])

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
				<div className="buttons">
					<button type="button" onClick={spawnRandomSquid}>
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
					<button type="button" onClick={spawnSquidPile}>
						Squid Pile
					</button>
				</div>
				<br />
				<div className="toggles">
					<Toggle text="Green Screen" onToggle={toggleGreenScreen} />
					<Toggle text="Space Mode" onToggle={toggleSpaceMode} startValue={false} />
				</div>
			</div>
		</div>
	)
}

export default Menu
