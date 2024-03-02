const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(express.json())
app.use(cors());

// Conexão com o MongoDB
const connection = mongoose.createConnection(process.env.MONGO_CS);
const db = connection.useDb('cesta_basica');

// Definição do esquema do documento
const ItemSchema = new mongoose.Schema({
  item: String,
  quantidadeNecessaria: Number,
  quantidadeDoada: Number,
  key: String
});

const ItemDonatedSchema = new mongoose.Schema({
  key: String,
  quantidade: Number,
  nome: String
});


const Item = db.model('Item', ItemSchema, 'items_para_doacao');
const ItemDonated = db.model('ItemDonated', ItemDonatedSchema, 'items_doados');

app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find();
    items.sort(compare)
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/donated-items', async (req, res) => {
  try {
    const items = await ItemDonated.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/items-donated', async (req, res) => {
  const { key, quantity, name } = req.body;

  try {
    const itemDonated = new ItemDonated({
      key: key,
      quantidade: quantity,
      nome: name
    });

    await itemDonated.save();
    console.log('Dados enviados para o MongoDB com sucesso!');
    res.status(201).json({ message: 'Dados salvos com sucesso no MongoDB' });
  } catch (error) {
    console.error('Erro ao enviar dados para o MongoDB:', error);
    res.status(500).json({ error: 'Erro ao salvar dados no MongoDB' });
  }
});

app.post('/api/items-to-donate', async (req, res) => {
  const { key, quantity } = req.body;

  try {
    const itemKey = key;
    const itemToDonate = await Item.findOne({ key: itemKey });

    if (itemToDonate) {
      itemToDonate.quantidadeDoada += quantity;
      console.log("itemToDonate", parseInt(quantity), itemToDonate);
      await itemToDonate.save();
    }

    console.log(await Item.findOne({ key: itemKey }));

    await itemToDonate.save();
    console.log('Dados enviados para o MongoDB com sucesso!');
    res.status(201).json({ message: 'Dados salvos com sucesso no MongoDB' });
  } catch (error) {
    console.error('Erro ao enviar dados para o MongoDB:', error);
    res.status(500).json({ error: 'Erro ao salvar dados no MongoDB' });
  }
});

app.put('/api/reset-donations', async (req, res) => {
  try {
    Item.updateMany({}, { $set: { quantidadeDoada: 0 } })
    ItemDonated.deleteMany();

    res.status(204).json({ message: 'Quantidade atualizada com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar quantidade:', error);
    res.status(500).json({ error: 'Erro ao atualizar quantidade.' });
  }
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});

function compare(a, b) {
  // Use toUpperCase() to ignore character casing
  const itemA = a.item.toUpperCase();
  const itemB = b.item.toUpperCase();

  let comparison = 0;
  if (itemA > itemB) {
    comparison = 1;
  } else if (itemA < itemB) {
    comparison = -1;
  }
  return comparison;
}
