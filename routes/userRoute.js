import express from 'express';
import fs from 'fs';

const router = express.Router();

const readData = () => JSON.parse(fs.readFileSync('./db/User.json'));
const writeData = (data) => fs.writeFileSync('./db/User.json', JSON.stringify(data));

router.get('/', (req, res) => {
    const data = readData();
    res.render("user", {data});
});

export default router;