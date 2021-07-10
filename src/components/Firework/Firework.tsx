import './Firework.css'

import React, { useCallback, useEffect, useState } from 'react'
import { Bodies, Body, Vector, World } from 'matter-js'
import { usePhysics } from '../PhysicsProvider'

const Firework: React.FC<{ className?: string; id?: number; x?: number; y?: number }> = ({
	className,
	id,
	x = 0,
	y = 0,
}) => {
	const [isSpawned, setIsSpawned] = useState(false)
	const { engine } = usePhysics()

	const create = useCallback(() => {
		const start = Vector.create(x, y)
		const brightnessValue = '55'
		const colors = [
			`#ff${brightnessValue}${brightnessValue}ff`,
			`#${brightnessValue}${brightnessValue}ffff`,
			`#ff${brightnessValue}ffff`,
			`#ffffffff`,
		]
		const color = colors[Math.floor(Math.random() * colors.length)]
		const minSize = 1
		const maxSize = 3

		const createParticle = (objectId: number) => {
			let forceVector = Vector.create(0, -1)
			forceVector = Vector.rotate(forceVector, Math.random() * 360 * (Math.PI / 180))
			const forceMin = 0.00005
			const forceMax = 0.0001
			forceVector = Vector.mult(forceVector, forceMin + Math.random() * (forceMax - forceMin))

			const newParticle = Bodies.circle(
				start.x,
				start.y,
				minSize + Math.random() * (maxSize - minSize),
				{
					label: `firework${id}-particle${objectId}`,
					restitution: 0,
					mass: 0.002,
					render: {
						fillStyle: color,
					},
					isStatic: false,
				}
			)
			Body.applyForce(newParticle, start, forceVector)

			if (engine?.current?.world) World.add(engine.current.world, newParticle)
			const fadeParticle = (time: number) => {
				const pcolor = newParticle.render.fillStyle?.substring(0, 7)
				const alpha =
					parseInt(`${newParticle.render.fillStyle?.substring(7, 9)}` || '', 16) - 4
				if (alpha < 20) {
					if (engine?.current?.world) World.remove(engine.current.world, newParticle)
				} else {
					let alphaHex = alpha.toString(16)
					if (alphaHex.length === 1) alphaHex += '0'
					if (alphaHex.length === 0) alphaHex = '00'
					requestAnimationFrame(fadeParticle)
					newParticle.render.fillStyle =
						pcolor + (alpha === 0 ? '00' : alpha.toString(16))
				}
			}
			requestAnimationFrame(fadeParticle)
		}

		for (let i = 0; i < 240; i++) {
			createParticle(i)
		}
	}, [engine, id, x, y])

	useEffect(() => {
		if (isSpawned) return
		create()
		setIsSpawned(true)
	}, [isSpawned, create])

	return <div data-test="Firework" className={`Firework ${className || ''}`} />
}

export default Firework
