import React, {
	createContext,
	useContext,
	useCallback,
	useEffect,
	useRef,
	useState,
	Dispatch,
	SetStateAction,
} from 'react'
import io from 'socket.io-client'
import feathers from '@feathersjs/client'
import createApplication from '@feathersjs/feathers'

interface Avatar {
	id?: number
	name?: string
	isSpawned?: boolean
	x?: number
	y?: number
	force?: number
}
interface EventOptions {
	onFollow: boolean
	onSub: boolean
	onCheer: boolean
}
interface AppData {
	avatars: Avatar[]
}

const defaultAppData: AppData = {
	avatars: [],
}

export const AppDataContext = createContext<{
	data: AppData
	avatars: Avatar[]
	splashs: Avatar[]
	fireworks: Avatar[]
	isGreenScreen: boolean
	update: (dataChange: Partial<AppData>) => void
	addAvatar: (newAvatar: Partial<Avatar>) => void
	removeAvatar: (id: number) => void
	addSplash: (newSplash: Partial<Avatar>) => void
	removeSplash: (id: number) => void
	addFirework: (newFirework: Partial<Avatar>) => void
	removeFirework: (id: number) => void
	setOptions: (eventOptions: EventOptions) => void
	setIsGreenScreen?: Dispatch<SetStateAction<boolean>>
}>({
	data: defaultAppData,
	avatars: [],
	splashs: [],
	fireworks: [],
	isGreenScreen: true,
	update: (dataChange: Partial<AppData>) => {},
	addAvatar: (newAvatar: Partial<Avatar>) => {},
	removeAvatar: (id: number) => {},
	addSplash: (newSplash: Partial<Avatar>) => {},
	removeSplash: (id: number) => {},
	addFirework: (newFirework: Partial<Avatar>) => {},
	removeFirework: (id: number) => {},
	setOptions: (eventOption: EventOptions) => {},
})

const AppDataProvider: React.FC = ({ children }) => {
	const [data, setData] = useState(defaultAppData)
	const [avatars, setAvatars] = useState<Avatar[]>([])
	const [splashs, setSplashs] = useState<Avatar[]>([])
	const [fireworks, setFireworks] = useState<Avatar[]>([])
	const [isGreenScreen, setIsGreenScreen] = useState(true)

	const [avatarOnFollow, setAvatarOnFollow] = useState(true)
	const [avatarOnSubscribe, setAvatarOnSubscribe] = useState(true)
	const [avatarOnCheer, setAvatarOnCheer] = useState(true)

	const avatarCount = useRef(0)
	const splashCount = useRef(0)
	const fireworkCount = useRef(0)

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const app = useRef<createApplication.Application<any>>()

	const update = useCallback((dataChange: Partial<AppData>) => {
		setData((currentData) => {
			return { ...currentData, ...dataChange }
		})
	}, [])

	const addAvatar = useCallback((newAvatar: Partial<Avatar>) => {
		setAvatars((originalAvatars: Avatar[]) => {
			const newFullAvatar: Avatar = {
				...newAvatar,
				...{
					name: newAvatar?.name || '',
					isSpawned: true,
					id: (avatarCount.current += 1),
				},
			}
			return [...originalAvatars, newFullAvatar]
		})
	}, [])

	const removeAvatar = useCallback((id) => {
		setAvatars((originalAvatars: Avatar[]) => {
			return originalAvatars.filter((avatar) => {
				if (id !== avatar.id) return true
				return false
			})
		})
	}, [])

	const addSplash = useCallback((newSplash: Partial<Avatar>) => {
		setSplashs((originalSplashs: Avatar[]) => {
			const newFullSplash: Avatar = {
				name: newSplash?.name || '',
				isSpawned: true,
				id: (splashCount.current += 1),
				x: newSplash.x,
				y: newSplash.y,
			}
			return [...originalSplashs, newFullSplash]
		})
	}, [])

	const removeSplash = useCallback((id) => {
		setSplashs((originalSplashs: Avatar[]) => {
			return originalSplashs.filter((splash) => {
				if (id !== splash.id) return true
				return false
			})
		})
	}, [])

	const addFirework = useCallback((newFirework: Partial<Avatar>) => {
		setFireworks((originalFireworks: Avatar[]) => {
			const newFullFirework: Avatar = {
				name: newFirework?.name || '',
				isSpawned: true,
				id: (fireworkCount.current += 1),
				x: newFirework.x,
				y: newFirework.y,
			}
			return [...originalFireworks, newFullFirework]
		})
	}, [])

	const removeFirework = useCallback((id) => {
		setFireworks((originalFireworks: Avatar[]) => {
			return originalFireworks.filter((firework) => {
				if (id !== firework.id) return true
				return false
			})
		})
	}, [])

	const setOptions = useCallback(
		({ onFollow, onSub, onCheer }: { onFollow: boolean; onSub: boolean; onCheer: boolean }) => {
			setAvatarOnFollow(onFollow)
			setAvatarOnSubscribe(onSub)
			setAvatarOnCheer(onCheer)
		},
		[]
	)

	useEffect(() => {
		const createApplicationConnection = () => {
			const socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:3030')
			app.current = feathers()
			app.current.configure(feathers.socketio(socket))
			app.current.configure(feathers.authentication())
		}
		createApplicationConnection()
	}, [])

	useEffect(() => {
		const onEventAddAvatar = ({ name }: { name: string }) => {
			addAvatar({ name })
		}
		if (app.current) {
			app.current.service('twitch-event-sub').on('follow', onEventAddAvatar)
			if (avatarOnSubscribe)
				app.current.service('twitch-event-sub').on('subscribe', onEventAddAvatar)
			if (avatarOnCheer) app.current.service('twitch-event-sub').on('cheer', onEventAddAvatar)
		}
		return () => {
			if (app.current) {
				app.current.service('twitch-event-sub').removeListener('follow', onEventAddAvatar)
				app.current
					.service('twitch-event-sub')
					.removeListener('subscribe', onEventAddAvatar)
				app.current.service('twitch-event-sub').removeListener('cheer', onEventAddAvatar)
			}
		}
	}, [addAvatar, avatarOnFollow, avatarOnSubscribe, avatarOnCheer])

	return (
		<AppDataContext.Provider
			value={{
				data,
				avatars,
				splashs,
				fireworks,
				isGreenScreen,
				update,
				addAvatar,
				removeAvatar,
				addSplash,
				removeSplash,
				addFirework,
				removeFirework,
				setOptions,
				setIsGreenScreen,
			}}
		>
			{children}
		</AppDataContext.Provider>
	)
}

export const useAppData = () => useContext(AppDataContext)
export default AppDataProvider
