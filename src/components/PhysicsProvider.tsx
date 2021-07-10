import { Engine, World, Bodies, Render, Runner, Events, Body } from 'matter-js'
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
	cleanup: () => void
	update: (data: Partial<PhysicsData>) => void
}>({
	data: defaultPhysicsData,
	scene: null,
	engine: null,
	width: 1920,
	height: 1080,
	cleanup: () => {},
	update: (data: Partial<PhysicsData>) => {},
})

export const PhysicsProvider: React.FC = ({ children }) => {
	const [data, setData] = useState(defaultPhysicsData)
	const scene = useRef<HTMLDivElement>(null)
	const engine = useRef<Engine>(Engine.create({}))
	const { addSplash, isGreenScreen } = useAppData()
	const width = 1920
	const height = 1080
	const wallThickness = 50

	const [chatWindow] = useState(
		Bodies.rectangle(width - 275, height - 245, 410, 360, {
			isStatic: true,
			label: 'chatwindow',
			render: {
				visible: false,
			},
		})
	)
	const [ceiling] = useState(
		Bodies.rectangle(width / 2, 0 - wallThickness / 2, width + wallThickness, wallThickness, {
			isStatic: true,
			label: 'ceiling',
		})
	)

	useEffect(() => {
		if (scene.current == null) return

		const createWalls = () => {
			World.add(engine.current.world, [
				ceiling,
				Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, {
					isStatic: true,
					label: 'left-wall',
				}),
				Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, {
					isStatic: true,
					label: 'right-wall',
				}),
				Bodies.rectangle(width / 2, height + 100, width, wallThickness, {
					isStatic: true,
					label: 'floor',
				}),
				chatWindow,
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
			Render.run(render)

			const framerate = 60
			const updateTime = 1000 / framerate
			engine.current.timing.timeScale = 1

			const frameUpdate = () => {
				Engine.update(engine.current, updateTime)
			}
			setInterval(frameUpdate, updateTime)
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
				const composite = findComposite(bodyB.label.split('-')[0])
				if (composite) {
					World.remove(world, composite)
					addSplash({ name: 'splash', x: bodyB.position.x, y: bodyB.position.y })
				}
			})
			const floorParticleCollisions = event.pairs.filter(({ bodyA, bodyB }) => {
				const particleLabels = ['splash', 'firework']
				const checkForLabel = (ids: string[], label: string) => {
					const idsFound = ids.filter((value) => {
						return label.indexOf(value) === 0
					})
					return idsFound.length > 0
				}
				if (bodyA.label === 'floor' && checkForLabel(particleLabels, bodyB.label))
					return true
				return false
			})
			floorParticleCollisions.forEach(({ bodyA, bodyB }) => {
				World.remove(world, bodyB)
			})
		})
	}, [addSplash])

	const update = useCallback((dataChange: Partial<PhysicsData>) => {
		setData((currentPhysics) => {
			return { ...currentPhysics, ...dataChange }
		})
	}, [])

	const cleanup = useCallback(() => {
		World.remove(engine.current.world, chatWindow)
		World.remove(engine.current.world, ceiling)
		setTimeout(() => {
			World.add(engine.current.world, chatWindow)
			World.add(engine.current.world, ceiling)
		}, 2000)
	}, [chatWindow])

	return (
		<PhysicsContext.Provider value={{ data, scene, engine, width, height, cleanup, update }}>
			<div className={`scene ${isGreenScreen ? 'greenscreen' : ''}`} ref={scene} />
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
