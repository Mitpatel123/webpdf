/**
 * @author Mukund Khunt
 * @description Server and REST API config
 */

import * as bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import http from 'http';
import os from 'os';
import * as packageInfo from '../package.json';
import { mongooseConnection } from './database/connection';
import { router } from './routes';
const app = express();


app.use(mongooseConnection)
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
global.osName = os.platform()

const health = (req, res) => {
    return res.status(200).json({
        message: "Node.js backend server is running",
        app: packageInfo.name,
        version: packageInfo.version,
        author: "Webito infotech",
        license: packageInfo.license,
        contributors: [
            {
                name: "Webito infotech",
                email: "webitoinfotech@gmail.com"
            }
        ]
    })
}
const bad_gateway = (req, res) => { return res.status(502).json({ status: 502, message: "box Backend API Bad Gateway!" }) }
app.get('/', health);
app.get('/health', health);
app.get('/isServerUp', (req, res) => { res.send('Server is running ') });
app.use(router)
app.use('*', bad_gateway);
let server = new http.Server(app);
export default server;


