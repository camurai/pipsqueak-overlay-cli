import './Squid.css'

import React, { useState, useEffect, useCallback } from 'react'
import { Bodies, Vector, Constraint, Composite, Body, World } from 'matter-js'
import { usePhysics } from '../PhysicsProvider'
import squidImage from '../../assets/squidhead.png'
import tentaclePartImage from '../../assets/tentaclepart.png'

const Squid: React.FC<{
	className?: string
	id: number
	force?: number
	spawnX?: number
	spawnY?: number
	vectorX?: number
	vectorY?: number
	torque?: number
}> = ({ className, id, force = 1, spawnX, spawnY, vectorX, vectorY, torque }) => {
	const [isSpawned, setIsSpawned] = useState(false)
	// const [isSettled, setIsSettled] = useState(false)
	const { width, height, engine } = usePhysics()

	const createSquid = useCallback(() => {
		const squidsize = 35
		const tentacleWidth = squidsize / 3
		const tentacleHeight = squidsize / 2
		const partScale = 0.1

		console.log(spawnX)

		const squidStartX = spawnX || 80 + Math.random() * (width - 480)
		const squidStartY = spawnY || height - 100
		const squidScale = 0.5
		const headScale = 0.08
		const squidWidth = squidsize * squidScale
		const partWidth = tentacleWidth * squidScale
		const partHeight = tentacleHeight * squidScale

		const newSquidHeadBody = Bodies.circle(squidStartX, squidStartY, squidWidth, {
			label: `squid${id}-head`,
			restitution: 1,
			mass: 0.5,
			render: {
				fillStyle: 'pink',
				sprite: {
					texture: squidImage,
					xScale: headScale * squidScale,
					yScale: headScale * squidScale,
				},
			},
			isStatic: false,
		})

		const createTentaclePart = (
			tentacleNumber: number,
			partNumber: number,
			connectionPoint: Vector,
			segments: number
		) => {
			const tentaclePart = Bodies.rectangle(
				squidStartX + connectionPoint.x,
				squidStartY + connectionPoint.y + partNumber * partHeight,
				partWidth - partNumber * (partWidth / (segments + 2)),
				partHeight,
				{
					mass: 0.05,
					render: {
						fillStyle: 'pink',
						sprite: {
							texture: tentaclePartImage,
							xScale: (partScale - partNumber * (0.08 / (segments + 2))) * squidScale,
							yScale: partScale * squidScale,
						},
					},
					label: `squid${id}-tentacle${tentacleNumber}-part${partNumber}`,
					isStatic: false,
				}
			)
			return tentaclePart
		}

		const createConstraint = (bodyA: Body, bodyB: Body, connectionPoint?: Vector) => {
			const constraint = Constraint.create({
				bodyA,
				bodyB,
				stiffness: 0.6,
				damping: 0.5,
				render: {
					visible: false,
				},
				pointA: connectionPoint || Vector.create(0, partHeight / 3),
				pointB: Vector.create(0, -partHeight / 3),
			})
			return constraint
		}
		const createTentacle = (tentacleNumber: number, segments: number = 8) => {
			let connectionPoint = Vector.create(-squidWidth, 0)
			connectionPoint = Vector.rotate(connectionPoint, -26 * tentacleNumber * (Math.PI / 180))
			const tentacleParts = []
			const tentaclePartContraints = []
			for (let i = 0; i < segments; i++) {
				tentacleParts.push(createTentaclePart(tentacleNumber, i, connectionPoint, segments))
				tentaclePartContraints.push(
					createConstraint(
						i === 0 ? newSquidHeadBody : tentacleParts[i - 1],
						tentacleParts[i],
						i === 0 ? connectionPoint : undefined
					)
				)
			}
			const tentacle = Composite.create({
				bodies: tentacleParts,
				constraints: tentaclePartContraints,
				label: `squid${id}-tentacle${tentacleNumber}`,
			})

			return tentacle
		}

		const createTentacles = () => {
			const tentacles = []
			for (let i = 0; i < 8; i++) {
				tentacles.push(createTentacle(i))
			}
			return tentacles
		}
		const tentacles = createTentacles()

		const newSquidHead = Composite.create({
			bodies: [newSquidHeadBody],
			label: `squid${id}-head`,
		})

		const newSquid = Composite.create({
			composites: [...tentacles, newSquidHead],
			label: `squid${id}`,
		})

		let forceVector = Vector.create(0, -1)
		if (vectorX || vectorY) {
			if (vectorX) forceVector.x = vectorX
			if (vectorY) forceVector.y = vectorY
		} else {
			forceVector = Vector.rotate(forceVector, (-45 + Math.random() * 90) * (Math.PI / 180))
		}
		forceVector = Vector.mult(forceVector, 0.3 * force)

		Body.applyForce(newSquidHeadBody, newSquidHeadBody.position, forceVector)
		Body.rotate(newSquidHeadBody, Math.random() * 360 * (Math.PI / 180))
		Body.setAngularVelocity(newSquidHeadBody, Math.random() * 6 - 3)
		if (engine?.current?.world) World.add(engine.current.world, newSquid)
	}, [engine, height, width, id, force, spawnX, spawnY, vectorX, vectorY])

	useEffect(() => {
		if (isSpawned) return
		createSquid()
		setIsSpawned(true)
	}, [isSpawned, createSquid])

	return <div data-test="Squid" className={`Squid ${className || ''}`} />
}

export default Squid
