import express from 'express'
import path from 'path'
import * as http from 'http'
import ejs from 'ejs'
import {Server} from 'socket.io'

const PORT = 3000;

class App {
    private server: http.Server
    private port: number
    private io: Server
    constructor(port: number) {
        const app = express();
        app.use(express.json());
        app.use(express.urlencoded({extended: true}));
        app.use(express.static(path.resolve(__dirname, '../client/')));

        this.server = http.createServer(app);
        this.port = port;
        this.io = new Server(this.server);
    }

    init(): App {
        this.io.on('connection', (socket) => {
            console.log(`Player ${socket.id} is connected.`); 

            socket.emit('message', `Hello ${socket.id}`);

            socket.broadcast.emit('message', `Say hello to ${socket.id}`);

            socket.on('disconnect', () => {
                console.log('socket disconected :' + socket.id);
            })
        })

        setInterval(() => {
            this.io.emit('random', Math.floor(Math.random() * 10))
        }, 1000);

        return this;
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(`Listenning on ${this.port}`);
        });
    }
}

new App(PORT).init().start();
