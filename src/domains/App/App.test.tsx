import React from 'react'
import { render, screen, cleanup, act, fireEvent } from '@testing-library/react'
import App from './App'

describe('<App />', () => {

	beforeEach(() => {
		render(<App/>)
    })
    
	afterEach(() => {
		cleanup()
		jest.clearAllMocks()
    })
    
    test('should render', async () => {
		expect(screen.getByTestId('App')).toMatchSnapshot()
	})
})
