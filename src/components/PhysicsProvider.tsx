import { Engine, Bodies, Render, Events, Composite } from 'matter-js'
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
	const {
		splashs,
		addSplash,
		avatars,
		removeAvatar,
		removeSplash,
		fireworks,
		removeFirework,
		isGreenScreen,
	} = useAppData()
	const width = 1920
	const height = 1080
	const wallThickness = 50
	const fireworksRef = useRef(fireworks)
	const splashsRef = useRef(splashs)
	const avatarsRef = useRef(avatars)

	fireworksRef.current = fireworks
	splashsRef.current = splashs
	avatarsRef.current = avatars

	const [chatWindow] = useState(
		Bodies.rectangle(width - 275, height - 250, 410, 360, {
			isStatic: true,
			label: 'chatwindow',
			render: {
				visible: true,
				fillStyle: 'green',
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

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const wallleft = Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, {
			isStatic: true,
			label: 'left-wall',
		})
		const wallright = Bodies.rectangle(
			width + wallThickness / 2,
			height / 2,
			wallThickness,
			height,
			{
				isStatic: true,
				label: 'right-wall',
			}
		)
		const floor = Bodies.rectangle(width / 2, height + 100, width, wallThickness, {
			isStatic: true,
			label: 'floor',
		})

		const createWalls = () => {
			Composite.add(engine.current.world, wallleft)
			Composite.add(engine.current.world, wallright)
			Composite.add(engine.current.world, floor)
			Composite.add(engine.current.world, ceiling)
			Composite.add(engine.current.world, chatWindow)
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
				const allBodies = Composite.allBodies(engine.current.world)
				const maxBodies = 700
				if (allBodies.length > maxBodies) {
					let removeTotal = allBodies.length - maxBodies
					allBodies.forEach((body) => {
						if (removeTotal > 0 && body.label.indexOf('particle') > 0) {
							Composite.remove(engine.current.world, body, true)
							removeTotal -= 1
						}
					})
					if (allBodies.length > maxBodies) {
						const allComposites = Composite.allComposites(engine.current.world)
						allComposites.forEach((composite) => {
							if (
								removeTotal > 0 &&
								composite.label.indexOf('squid') >= 0 &&
								composite.label.indexOf('tentacle') < 0
							) {
								Composite.remove(engine.current.world, composite, true)
								removeTotal -= 70
							}
						})
					}
				}
				avatarsRef.current.forEach(({ id }) => {
					const foundBodies = allBodies.filter(({ label }) => {
						return label.indexOf(`squid${id}`) >= 0
					})
					if (foundBodies.length === 0 && id !== undefined) removeAvatar(id)
				})
				splashsRef.current.forEach(({ id }) => {
					const foundBodies = allBodies.filter(({ label }) => {
						return label.indexOf(`splash${id}`) >= 0
					})
					if (foundBodies.length === 0 && id !== undefined) removeSplash(id)
				})
				fireworksRef.current.forEach(({ id }) => {
					const foundBodies = allBodies.filter(({ label }) => {
						return label.indexOf(`firework${id}`) >= 0
					})
					if (foundBodies.length === 0 && id !== undefined) removeFirework(id)
				})
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
					Composite.remove(world, composite)

					removeAvatar(parseInt(composite.label.substring(5), 10))
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
				Composite.remove(world, bodyB)
				const [compositeId] = bodyB.label.split('-')

				const allBodies = Composite.allBodies(world)
				let bodyCount = 0
				allBodies.forEach(({ label }) => {
					if (label.indexOf(compositeId) >= 0) bodyCount += 1
				})
				if (bodyCount === 0) {
					if (compositeId.indexOf('splash') === 0)
						removeSplash(parseInt(compositeId.substring(6), 10))
					if (compositeId.indexOf('firework') === 0)
						removeFirework(parseInt(compositeId.substring(8), 10))
				}
			})
		})
	}, [addSplash, removeSplash, removeFirework, removeAvatar, ceiling, chatWindow])

	const update = useCallback((dataChange: Partial<PhysicsData>) => {
		setData((currentPhysics) => {
			return { ...currentPhysics, ...dataChange }
		})
	}, [])

	const cleanup = useCallback(() => {
		let timeout: NodeJS.Timeout
		if (chatWindow.render.visible === true) {
			Composite.remove(engine.current.world, chatWindow)
			Composite.remove(engine.current.world, ceiling)
			chatWindow.render.visible = false
			// eslint-disable-next-line prefer-const
			timeout = setTimeout(() => {
				Composite.add(engine.current.world, chatWindow)
				Composite.add(engine.current.world, ceiling)
				chatWindow.render.visible = true
			}, 2000)
		}

		return () => {
			if (timeout) clearTimeout(timeout)
		}
	}, [chatWindow, ceiling])

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
