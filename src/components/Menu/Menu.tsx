import './Menu.css'

import React, { useCallback } from 'react'
import { useAppData } from '../AppDataProvider'

const Menu: React.FC<{ className?: string }> = ({ className }) => {
	const { addAvatar } = useAppData()

	const spawnSquid = useCallback(() => {
		addAvatar({ name: 'another one' })
	}, [])

	return (
		<div data-test="Menu" className={`Menu ${className || ''}`}>
			<button type="button" onClick={spawnSquid}>
				Spawn Squid
			</button>
		</div>
	)
}

export default Menu
