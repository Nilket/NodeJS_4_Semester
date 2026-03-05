import express from 'express';
const app = express();

app.use(express.static('public'));

app.use(express.json());

import path from 'path';

// ================ Pages =====================

app.get('/', (req, res) =>{
    res.sendFile(path.resolve('public/pages/frontend/frontend.html'));
});

app.get('/about', (req, res) =>{
    res.sendFile(path.resolve('public/pages/about/about.html'));
});

// ================== API =====================

import { getOrCreateSandboxContext, executeCodeInSandbox } from './util/replUtil.js'; 

app.post('/api/repl', (req,res) =>{
    // let replCode = req.body?.replCode;

    if(!req.body){
        return res.status(400).send({errorMessage: 'Missing a JSON body'});
    }

    const {replCode,sandboxId} = req.body;

    if(!replCode){
        return res.status(400).send({errorMessage: 'Missing the key replCode in the JSON body'});
    }

    const sandbox = getOrCreateSandboxContext(sandboxId);

    const {error, success, output, result} = executeCodeInSandbox(sandbox,replCode);

    if(error){
        return res.status(500).send({
            data:{ error },
            errorMessage: 'Error executing the provided code'
           });
    }

    //replCode = replCode.replace('console.log(', '').replace(')');

    res.send({data: {success, output, result}});
});


const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
    console.log("Lytter på port " + server.address().port);
});