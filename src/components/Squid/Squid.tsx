import './Squid.css'

import React from 'react'
import { useSpring, animated, useChain, useSpringRef } from 'react-spring'

const Squid: React.FC<{ className?: string }> = ({ className }) => {
	const gravityAnimation = useSpring({
		from: { transform: `translateY(0em)` },
		to: { transform: `translateY(12.8em)` },
		config: {
			tension: 100,
			friction: 0,
			velocity: 0,
			mass: 100,
		},
	})
	return (
		<animated.div
			style={gravityAnimation}
			data-test="Squid"
			className={`Squid ${className || ''}`}
		/>
	)
}

export default Squid
