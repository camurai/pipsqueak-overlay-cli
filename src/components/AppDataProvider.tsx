import React, { createContext, useContext, useCallback, useState } from 'react'

interface Avatar {
	id?: number
	name?: string
	isSpawned?: boolean
	x?: number
	y?: number
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
	update: (dataChange: Partial<AppData>) => void
	addAvatar: (newAvatar: Partial<Avatar>) => void
	addSplash: (newSplash: Partial<Avatar>) => void
}>({
	data: defaultAppData,
	avatars: [],
	splashs: [],
	update: (dataChange: Partial<AppData>) => {},
	addAvatar: (newAvatar: Partial<Avatar>) => {},
	addSplash: (newSplash: Partial<Avatar>) => {},
})

const AppDataProvider: React.FC = ({ children }) => {
	const [data, setData] = useState(defaultAppData)
	const [avatars, setAvatars] = useState<Avatar[]>([])
	const [splashs, setSplashs] = useState<Avatar[]>([])

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
			console.log(newFullSplash)
			return [...originalSplashs, newFullSplash]
		})
	}, [])

	return (
		<AppDataContext.Provider value={{ data, avatars, splashs, update, addAvatar, addSplash }}>
			{children}
		</AppDataContext.Provider>
	)
}

export const useAppData = () => useContext(AppDataContext)
export default AppDataProvider
