import React, { createContext, useContext, useCallback, useState } from 'react'

interface Avatar {
	name: string
	isSpawned?: boolean
}

interface AppData {
	avatars: Avatar[]
}

const defaultAppData: AppData = {
	avatars: [{ name: 'number one' }],
}

export const AppDataContext = createContext({
	data: defaultAppData,
	update: (dataChange: Partial<AppData>) => {},
})

const AppDataProvider: React.FC = ({ children }) => {
	const [data, setData] = useState(defaultAppData)

	const update = useCallback((dataChange: Partial<AppData>) => {
		setData((currentData) => {
			return { ...currentData, ...dataChange }
		})
	}, [])

	return <AppDataContext.Provider value={{ data, update }}>{children}</AppDataContext.Provider>
}

export const useAppData = () => useContext(AppDataContext)
export default AppDataProvider
