import { Engine, World, Bodies, Render, Runner, Events } from 'matter-js'
import React, { createContext, useContext, useCallback, useState, useRef, useEffect } from 'react'
import type { RefObject } from 'react'
import { useAppData } from './AppDataProvider'

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
	const { addSplash } = useAppData()
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
				Bodies.rectangle(width / 2, height + 100, width, wallThickness, {
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
			const { world } = engine.current

			const findComposite = (searchLabel: string) => {
				const composite = world.composites.find(({ label }) => {
					return label === searchLabel
				})
				return composite
			}
			const floorHeadCollisions = event.pairs.filter(({ bodyA, bodyB }) => {
				if (bodyA.label === 'floor' && bodyB.label.indexOf('squid') === 0) return true
				if (bodyB.label === 'floor' && bodyA.label.indexOf('squid') === 0) return true
				return false
			})
			floorHeadCollisions.forEach(({ bodyA, bodyB }) => {
				// if (bodyA.label === 'floor') {
				const composite = findComposite(bodyB.label.split('-')[0])
				if (composite) {
					World.remove(world, composite)
					addSplash({ name: 'splash', x: bodyB.position.x, y: bodyB.position.y })
				}
				// }
				/* if (bodyB.label === 'floor') {
					const composite = findComposite(bodyA.label.split('-')[0])
					if (composite) {
						World.remove(world, composite)
						console.log('addSplash')
						addSplash({ name: 'splash', x: bodyA.position.x, y: bodyA.position.y })
					}
				} */
			})
			const floorSplashCollisions = event.pairs.filter(({ bodyA, bodyB }) => {
				if (bodyA.label === 'floor' && bodyB.label.indexOf('splash') === 0) return true
				/* if (bodyB.label === 'floor' && bodyA.label.indexOf('squid') === 0) return true */
				return false
			})
			floorSplashCollisions.forEach(({ bodyA, bodyB }) => {
				// if (bodyA.label === 'floor') {
				// const composite = findComposite(bodyB.label.split('-')[0])
				// if (composite) {
				console.log('slash death')
				World.remove(world, bodyB)
				// addSplash({ name: 'splash', x: bodyB.position.x, y: bodyB.position.y })
				// }
				// }
			})
		})
	}, [addSplash])

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
