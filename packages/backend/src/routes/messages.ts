import { Router } from 'express'
import { UUID } from 'node:crypto';
import { WebSocketServer } from 'ws';
import log from '../lib/winston.js'

const messagesRouter = Router();
messagesRouter.get('/messages', (req, res) => {

});

const getMessagesByRoom = (roomId: UUID) => {
  
};

const getMessages = () => {

}

export { messagesRouter };