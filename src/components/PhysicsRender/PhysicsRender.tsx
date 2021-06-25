import './PhysicsRender.css'

import React, { useEffect, useRef } from 'react'
import Matter, { Engine, Runner, Render, World, Bodies, Body, Vector, Composite } from 'matter-js'
import { useAppData } from '../AppDataProvider'
import squidImage from '../../assets/squidhead.png'
import tentaclePartImage from '../../assets/tentaclepart.png'

const PhysicsRender: React.FC<{ className?: string }> = ({ className }) => {
	const { data } = useAppData()

	const scene = useRef<HTMLDivElement>(null)
	const engine = useRef<Engine>(Engine.create({}))

	const width = 1000
	const height = 600
	const wallThickness = 10

	useEffect(() => {
		if (scene.current == null) return

		scene.current.innerHTML = ''
		const render = Render.create({
			element: scene.current,
			engine: engine.current,
			options: {
				width,
				height,
				wireframes: false,
			},
		})
		World.add(engine.current.world, [
			// walls
			// Bodies.rectangle(width / 2, 0, width, wallThickness, { isStatic: true }),
			// Bodies.rectangle(0, height / 2, wallThickness, height, { isStatic: true }),
			// Bodies.rectangle(width, height / 2, wallThickness, height, { isStatic: true }),
			// Bodies.rectangle(width / 2, height, width, wallThickness, { isStatic: true }),
		])
		Runner.run(engine.current)
		Render.run(render)
	}, [])

	useEffect(() => {
		const squidsize = 35
		const tentacleWidth = squidsize / 3
		const tentacleHeight = squidsize / 2
		const partScale = 0.1

		data.avatars.forEach(({ name, isSpawned }) => {
			if (!isSpawned) {
				const squidStartX = 80
				const squidStartY = 400
				const squidScale = 0.5
				const headScale = 0.08
				const squidWidth = squidsize * squidScale
				const partWidth = tentacleWidth * squidScale
				const partHeight = tentacleHeight * squidScale

				const newSquidHeadBody = Bodies.circle(squidStartX, squidStartY, squidWidth, {
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
									xScale:
										(partScale - partNumber * (0.08 / (segments + 2))) *
										squidScale,
									yScale: partScale * squidScale,
								},
							},
							isStatic: false,
						}
					)
					return tentaclePart
				}

				const createConstraint = (bodyA: Body, bodyB: Body, connectionPoint?: Vector) => {
					const constraint = Matter.Constraint.create({
						bodyA,
						bodyB,
						stiffness: 0.3,
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
					connectionPoint = Vector.rotate(
						connectionPoint,
						-26 * tentacleNumber * (Math.PI / 180)
					)
					const tentacleParts = []
					const tentaclePartContraints = []
					for (let i = 0; i < segments; i++) {
						tentacleParts.push(createTentaclePart(i, connectionPoint, segments))
						tentaclePartContraints.push(
							createConstraint(
								i === 0 ? newSquidHeadBody : tentacleParts[i - 1],
								tentacleParts[i],
								i === 0 ? connectionPoint : undefined
							)
						)
					}
					const tentacle = Matter.Composite.create({
						bodies: tentacleParts,
						constraints: tentaclePartContraints,
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
				})

				const newSquid = Composite.create({
					composites: [...tentacles, newSquidHead],
				})

				const force = Vector.create(0.1, -0.15)
				Body.applyForce(newSquidHeadBody, newSquidHeadBody.position, force)
				World.add(engine.current.world, newSquid)
			}
		})
	}, [data.avatars])

	return <div ref={scene} />
}

export default PhysicsRender
