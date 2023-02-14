// // Copyright (c) Microsoft Corporation.
// // Licensed under the MIT license.

const ort = require('onnxruntime-node');
const express = require('express');
const Joi = require('joi'); //used for validation
const app = express();
app.use(express.json());

const models = [
    { title: 'Model_1', id: 1 },
]

// use an async context to call onnxruntime functions.
async function get_data(array) {
    try {
        const session = await ort.InferenceSession.create('./diabetes-model.onnx');

        inputName = session.handler.inputNames
        outputName = session.handler.outputNames
        console.log(`inputName = ${inputName}  outputName = ${outputName}`)

        const data = Float32Array.from(array);
        const tensor = new ort.Tensor('float32', data, [1,21]);

        // const results = await session.run([label_name], {input_name: data});

        // // prepare feeds. use model input names as keys.
        const feeds = {x: tensor};

        // feed inputs and run
        const results = await session.run(feeds);

        // read from results
        const output = results[outputName].data;
        console.log(`ouput: ${output}`);

        return output

    } catch (e) {
        console.error(`failed to inference ONNX model: ${e}.`);
    }
}

//READ Request Handlers
app.get('/', (req, res) => {
    res.send('Welcome');
});

app.get('/api/models', (req, res) => {
    res.send(models);
});

//CREATE Request Handler
app.post('/api/model_1', async (req, res) => {
    array =  req.body.array
    reult = await get_data(array)

    res.send({output : reult});
});

//PORT ENVIRONMENT VARIABLE
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}..`));