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
	isGreenScreen: boolean
	update: (dataChange: Partial<AppData>) => void
	addAvatar: (newAvatar: Partial<Avatar>) => void
	addSplash: (newSplash: Partial<Avatar>) => void
	setOptions: (eventOptions: EventOptions) => void
	setIsGreenScreen?: Dispatch<SetStateAction<boolean>>
}>({
	data: defaultAppData,
	avatars: [],
	splashs: [],
	isGreenScreen: true,
	update: (dataChange: Partial<AppData>) => {},
	addAvatar: (newAvatar: Partial<Avatar>) => {},
	addSplash: (newSplash: Partial<Avatar>) => {},
	setOptions: (eventOption: EventOptions) => {},
})

const AppDataProvider: React.FC = ({ children }) => {
	const [data, setData] = useState(defaultAppData)
	const [avatars, setAvatars] = useState<Avatar[]>([])
	const [splashs, setSplashs] = useState<Avatar[]>([])
	const [isGreenScreen, setIsGreenScreen] = useState(true)

	const [avatarOnFollow, setAvatarOnFollow] = useState(true)
	const [avatarOnSubscribe, setAvatarOnSubscribe] = useState(true)
	const [avatarOnCheer, setAvatarOnCheer] = useState(true)

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
				name: newAvatar?.name || '',
				isSpawned: true,
				id: originalAvatars.length,
			}
			return [...originalAvatars, newFullAvatar]
		})
	}, [])

	const addSplash = useCallback((newSplash: Partial<Avatar>) => {
		setSplashs((originalSplashs: Avatar[]) => {
			const newFullSplash: Avatar = {
				name: newSplash?.name || '',
				isSpawned: true,
				id: originalSplashs.length,
				x: newSplash.x,
				y: newSplash.y,
			}
			return [...originalSplashs, newFullSplash]
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
			const socket = io('http://localhost:3030')
			app.current = feathers()
			app.current.configure(feathers.socketio(socket))
			app.current.configure(feathers.authentication())
			console.log('connection started')
		}
		createApplicationConnection()
	}, [])

	useEffect(() => {
		const onEventAddAvatar = ({ name }: { name: string }) => {
			addAvatar({ name })
		}
		if (app.current) {
			console.log(`avatarOnFollow:${avatarOnFollow}`)
			if (avatarOnFollow) console.log('added follow')
			app.current.service('twitch-event-sub').on('follow', onEventAddAvatar)
			if (avatarOnSubscribe)
				app.current.service('twitch-event-sub').on('subscribe', onEventAddAvatar)
			if (avatarOnCheer) app.current.service('twitch-event-sub').on('cheer', onEventAddAvatar)
		}
		return () => {
			if (app.current) {
				console.log('removedfollow')
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
				isGreenScreen,
				update,
				addAvatar,
				addSplash,
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
