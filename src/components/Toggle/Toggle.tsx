import './Toggle.css'

import React, { useState } from 'react'
import { useSpring, animated } from 'react-spring'

const Toggle: React.FC<{ className?: string; text?: string; onToggle?: (value: boolean) => void }> =
	({ className, text, onToggle }) => {
		const [isToggled, setToggle] = useState(true)
		const fade = useSpring({
			opacity: isToggled ? 1 : 0,
		})

		const greenScreenToggle = () => {
			setToggle(!isToggled)
			if (onToggle) onToggle(!isToggled)
		}

		return (
			<div data-test="Toggle" className={`Toggle ${className || ''}`}>
				<button type="button" onClick={greenScreenToggle}>
					{text}
				</button>
				<animated.div style={fade} className="checkmark">
					✓
				</animated.div>
			</div>
		)
	}

export default Toggle
