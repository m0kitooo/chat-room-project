import { jwtVerify, SignJWT } from 'jose';
import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 }, () => console.log('Started'));
wss.on('connection', (websocket, req) => {
  console.log('Connected', req.socket.remoteAddress);
  console.log(req.url);
  websocket.emit('userJoined', )
});

const ws = new WebSocket('ws://localhost:8080');



export const formatTimeSec = (value: number): string => {
  let days = 0, hours = 0, minutes = 0;
  let minInSec = 60, hInSec = 60 * minInSec, dInSec = 24 * hInSec;
  let temp: number;
  if ((temp = value / dInSec) > 1) {
    days = Math.trunc(temp);
    value %= dInSec;
  }
  if ((temp = value / hInSec) > 1) {
    hours = Math.trunc(temp);
    value %= hInSec;
  }
  if ((temp = value / minInSec) > 1) {
    minutes = Math.trunc(temp);
    value %= minInSec;
  }

  const labelQuantity = (quantity: number, label: string) => quantity > 0 
    ? quantity > 1
      ? `${quantity} ${label}s`
      : `${quantity} ${label}`
    : '';

  return [labelQuantity(days, 'day'), labelQuantity(hours, 'hour'), labelQuantity(minutes, 'minute'), labelQuantity(value, 'second')]
    .filter(Boolean)  
    .join(' ');
};

console.log(formatTimeSec(3600));
