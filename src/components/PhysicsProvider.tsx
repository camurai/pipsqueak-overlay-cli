import { Engine, World, Bodies, Render, Runner, Events } from 'matter-js'
import React, { createContext, useContext, useCallback, useState, useRef, useEffect } from 'react'
import type { RefObject } from 'react'

interface PhysicsData {
	scene: HTMLDivElement | null
}

const defaultPhysicsData: PhysicsData = {
	scene: null,
}

export const PhysicsContext = createContext<{
	data: PhysicsData
	scene: RefObject<HTMLDivElement> | null
	engine: RefObject<Engine> | null
	width: number
	height: number
	update: (data: Partial<PhysicsData>) => void
}>({
	data: defaultPhysicsData,
	scene: null,
	engine: null,
	width: 1000,
	height: 600,
	update: (data: Partial<PhysicsData>) => {},
})

export const PhysicsProvider: React.FC = ({ children }) => {
	const [data, setData] = useState(defaultPhysicsData)
	const scene = useRef<HTMLDivElement>(null)
	const engine = useRef<Engine>(Engine.create({}))
	const width = 1000
	const height = 600

	useEffect(() => {
		if (scene.current == null) return

		const createWalls = () => {
			const wallThickness = 10
			World.add(engine.current.world, [
				Bodies.rectangle(width / 2, 0, width, wallThickness, {
					isStatic: true,
					label: 'ceiling',
				}),
				Bodies.rectangle(0, height / 2, wallThickness, height, { isStatic: true }),
				Bodies.rectangle(width, height / 2, wallThickness, height, { isStatic: true }),
				Bodies.rectangle(width / 2, height, width, wallThickness, {
					isStatic: true,
					label: 'floor',
				}),
			])
		}

		const createWorld = () => {
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
			createWalls()
			Runner.run(engine.current)
			Render.run(render)
		}

		createWorld()
		Events.on(engine.current, 'collisionStart', (event) => {
			const floorHeadCollisions = event.pairs.filter(({ bodyA, bodyB }) => {
				if (bodyA.label === 'floor' && bodyB.label === 'squid-head') return true
				if (bodyB.label === 'floor' && bodyA.label === 'squid-head') return true
				return false
			})
			floorHeadCollisions.forEach(({ bodyA, bodyB }) => {
				console.log(bodyA)
				if (bodyA.label === 'floor') World.remove(engine.current.world, bodyB.parent)
				if (bodyB.label === 'floor') World.remove(engine.current.world, bodyA)
			})
		})
	}, [])

	const update = useCallback((dataChange: Partial<PhysicsData>) => {
		setData((currentPhysics) => {
			return { ...currentPhysics, ...dataChange }
		})
	}, [])

	return (
		<PhysicsContext.Provider value={{ data, scene, engine, width, height, update }}>
			<div className="scene" ref={scene} />
			{children}
		</PhysicsContext.Provider>
	)
}

export const usePhysics = () => useContext(PhysicsContext)
export const useWorld = () => {
	const { engine } = usePhysics()
	return engine?.current?.world
}
export const useEngine = () => {
	const { engine } = usePhysics()
	return engine
}
export default PhysicsProvider
