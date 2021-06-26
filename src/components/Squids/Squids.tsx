import './Squids.css'

import React from 'react'
import { useAppData } from '../AppDataProvider'
import Squid from '../Squid'

const Squids: React.FC<{ className?: string }> = ({ className }) => {
	const { avatars } = useAppData()
	console.log(avatars)
	return (
		<div data-test="Squids" className={`Squids ${className || ''}`}>
			{avatars.map(({ id }) => (
				<Squid key={id} />
			))}
		</div>
	)
}

export default Squids
