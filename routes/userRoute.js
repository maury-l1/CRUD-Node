import express from 'express';
import fs from 'fs';

const router = express.Router();

const readData = () => JSON.parse(fs.readFileSync('./db/User.json'));
const writeData = (data) => fs.writeFileSync('./db/User.json', JSON.stringify(data));

router.get('/', (req, res) => {
    const data = readData();
    res.render("user", {data});
});

router.get('/:id', (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const user = data.find(user => user.id === id);
    if(!user) return res.status(404).send("Usuario no encontrado");
    res.render("detailUser", {user});
});

router.get('/:id/edit', (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const user = data.find(user => user.id === id);
    if (!user) return res.status(404).send('user not found');
    res.render("editUser", {user});
});

router.delete('/:id', (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const userIndex = data.findIndex(user => user.id === id);
    if (userIndex === -1) return res.status(404).send('user not found');
    data.splice(userIndex, 1);
    writeData(data);
    res.status(200).send('User deleted successfully');
});

router.put('/:id', (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const userIndex = data.findIndex(user => user.id === id);
    if (userIndex === -1) return res.status(404).send('User not found');
    data[userIndex] = { ...data[userIndex], ...req.body };
    writeData(data);
    res.redirect("/userRoute");
});

export default router;
