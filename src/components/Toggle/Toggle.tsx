import './Toggle.css'

import React, { useState } from 'react'
import { useSpring, animated } from 'react-spring'

const Toggle: React.FC<{ className?: string }> = ({ className }) => {
	const [isToggled, setToggle] = useState(false)
	const fade = useSpring({
		opacity: isToggled ? 1 : 0,
	})

	return (
		<div data-test="Toggle" className={`Toggle ${className || ''}`}>
			<animated.h1 style={fade}>Hello</animated.h1>
			<button type="button" onClick={() => setToggle(!isToggled)}>
				toggle
			</button>
		</div>
	)
}

export default Toggle
