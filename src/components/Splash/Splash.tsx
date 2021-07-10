import './Splash.css'

import React, { useCallback, useEffect, useState } from 'react'
import { Bodies, Body, Vector, World } from 'matter-js'
import { usePhysics } from '../PhysicsProvider'

const Splash: React.FC<{ className?: string; id?: number; x?: number; y?: number }> = ({
	className,
	id,
	x = 0,
	y = 0,
}) => {
	const [isSpawned, setIsSpawned] = useState(false)
	const { engine } = usePhysics()

	const createSplash = useCallback(() => {
		// const splashSize = 35
		// const splashScale = 1
		// const splashStart = Vector.create(80 + Math.random() * (width - 160), height)
		const splashStart = Vector.create(x, y - 20)

		const createSplashParticle = (splashId: number) => {
			let forceVector = Vector.create(0, -1)
			forceVector = Vector.rotate(forceVector, (-45 + Math.random() * 90) * (Math.PI / 180))
			forceVector = Vector.mult(forceVector, 0.02 + Math.random() * 0.02)
			const brightness = 100 + Math.round(Math.random() * 155)

			const newSplashParticle = Bodies.circle(
				splashStart.x,
				splashStart.y,
				1 + Math.random() * 5,
				{
					label: `splash${id}-particle${splashId}`,
					restitution: 1,
					mass: 0.5,
					render: {
						fillStyle: `#${brightness.toString(16)}${brightness.toString(16)}FF`,
					},
					isStatic: false,
				}
			)
			Body.applyForce(newSplashParticle, splashStart, forceVector)
			if (engine?.current?.world) World.add(engine.current.world, newSplashParticle)

			const killParticle = (time: number) => {
				if (!engine?.current) return
				if (!engine.current.world.bodies.includes(newSplashParticle)) return

				if (newSplashParticle.position.y > y + 100) {
					World.remove(engine.current.world, newSplashParticle)
				} else {
					requestAnimationFrame(killParticle)
				}
			}
			requestAnimationFrame(killParticle)
		}

		for (let i = 0; i < 100; i++) {
			createSplashParticle(i)
		}
	}, [engine, id, x, y])

	useEffect(() => {
		if (isSpawned) return
		createSplash()
		setIsSpawned(true)
	}, [isSpawned, createSplash])

	return <div data-test={`Splash${id}`} className={`Splash ${className || ''}`} />
}

export default Splash
