import React, { createContext, useContext, useCallback, useState } from 'react'
import { PhysicsProvider } from './PhysicsProvider'

interface Avatar {
	id?: number
	name?: string
	isSpawned?: boolean
}

interface AppData {
	avatars: Avatar[]
}

const defaultAppData: AppData = {
	avatars: [{ id: 1, name: 'number one' }],
}

export const AppDataContext = createContext<{
	data: AppData
	avatars: Avatar[]
	update: (dataChange: Partial<AppData>) => void
	addAvatar: (newAvatar: Avatar) => void
}>({
	data: defaultAppData,
	avatars: [],
	update: (dataChange: Partial<AppData>) => {},
	addAvatar: (newAvatar: Avatar) => {},
})

const AppDataProvider: React.FC = ({ children }) => {
	const [data, setData] = useState(defaultAppData)
	const [avatars, setAvatars] = useState<Avatar[]>([{ id: 1, name: 'number one' }])

	const update = useCallback((dataChange: Partial<AppData>) => {
		setData((currentData) => {
			return { ...currentData, ...dataChange }
		})
	}, [])

	const addAvatar = useCallback((newAvatar: Partial<Avatar>) => {
		console.log('Add avatar')
		setAvatars((originalAvatars: Avatar[]) => {
			const newFullAvatar: Avatar = {
				name: newAvatar?.name || '',
				isSpawned: true,
				id: originalAvatars.length,
			}
			return [...originalAvatars, newFullAvatar]
		})
	}, [])

	return (
		<AppDataContext.Provider value={{ data, avatars, update, addAvatar }}>
			<PhysicsProvider>{children}</PhysicsProvider>
		</AppDataContext.Provider>
	)
}

export const useAppData = () => useContext(AppDataContext)
export default AppDataProvider
