import io from 'socket.io-client'
import feathers from '@feathersjs/client'
import socketio from '@feathersjs/socketio-client'

const server = process.env.REACT_APP_SERVER
const socket = io(server || '')

const client = feathers()

client.configure(socketio(socket))
client.configure(
	feathers.authentication({
		storage: window.localStorage,
	})
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createDocument = (collectionName: string, documentData: any) => {
	client
		.service(collectionName)
		.create(documentData)
		.catch((e: Error) => {
			// TODO: pass error to calling function to notify user of error in process
			// console.warn('Error with createDocument:', e.message)
		})
}

export const updateDocument = (
	collectionName: string,
	id: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	documentData: any
) => {
	client
		.service(collectionName)
		.patch(id, documentData)
		.catch((e: Error) => {
			// TODO: pass error to calling function to notify user of error in process
			// console.warn('Error with updateDocument:', e.message)
		})
}

export const deleteDocument = (collectionName: string, documentId: string) => {
	client
		.service(collectionName)
		.remove(documentId)
		.catch((e: Error) => {
			// TODO: pass error to calling function to notify user of error in process
			// console.warn('Error with deleteDocument:', e.message)
		})
}

export default client
