import './Squids.css'

import React from 'react'
import { useAppData } from '../AppDataProvider'
import Squid from '../Squid'

const Squids: React.FC<{ className?: string }> = ({ className }) => {
	const { avatars } = useAppData()
	return (
		<div data-test="Squids" className={`Squids ${className || ''}`}>
			{avatars.map(({ id }) => (
				<Squid key={id} id={id || 0} />
			))}
		</div>
	)
}

export default Squids
