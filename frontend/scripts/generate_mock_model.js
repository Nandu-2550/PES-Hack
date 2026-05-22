import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateMockModel() {
  const outDir = path.join(__dirname, '../public/web_model');
  fs.mkdirSync(outDir, { recursive: true });

  // Create a dummy model.json to satisfy caching rules
  const modelJson = {
    format: "layers-model",
    generatedBy: "keras v2.10.0",
    convertedBy: "TensorFlow.js Converter v4.17.0",
    modelTopology: {
      keras_version: "2.10.0",
      backend: "tensorflow",
      model_config: { class_name: "Sequential", config: { name: "sequential_1", layers: [] } }
    },
    weightsManifest: [
      {
        paths: ["group1-shard1of1.bin"],
        weights: [{ name: "dense_1/kernel", shape: [100, 6], dtype: "float32" }]
      }
    ]
  };

  fs.writeFileSync(path.join(outDir, 'model.json'), JSON.stringify(modelJson, null, 2));
  fs.writeFileSync(path.join(outDir, 'group1-shard1of1.bin'), Buffer.from('dummy weights'));

  console.log('Mock TF.js model saved to public/web_model/');
}

generateMockModel();
