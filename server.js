// const express = require('express');
// const app = express();

// // Rota de exemplo
// app.get('/', (req, res) => {
//   res.json({ message: 'Olá! Bem-vindo à minha API.' });
// });

// // Rota com parâmetros
// app.get('/hello/:name', (req, res) => {
//   const { name } = req.params;
//   res.json({ message: `Olá, ${name}!` });
// });

// // Configuração da porta do servidor
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Servidor rodando na porta ${PORT}`);
// });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(express.json())
app.use(cors());

// Conexão com o MongoDB
const connection = mongoose.createConnection('mongodb+srv://test:kwBe5Tn5FNs4XesI@cluster0.zj1tsoh.mongodb.net/?retryWrites=true&w=majority');
const db = connection.useDb('cesta_basica');

// Definição do esquema do documento
const ItemSchema = new mongoose.Schema({
  item: String,
  quantidadeNecessaria: Number
});

const ItemDonatedSchema = new mongoose.Schema({
  key: String,
  quantidade: Number,
  nome: String
});


// Modelo para a collection 'items_para_doacao'
const Item = db.model('Item', ItemSchema, 'items_para_doacao');
const ItemDonated = db.model('ItemDonated', ItemDonatedSchema, 'items_doados');

// Rota GET para obter dados do MongoDB
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find();
    items.sort(compare)
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/items-donated', async (req, res) => {
  const { key, quantity, name } = req.body;

  try {
    const itemKey = key;
    const documentId = Item.findOne(itemKey, '_id', (err, foundDocument) => {
      if (err) {
        console.error(err);
      } else {
        if (foundDocument) {
          console.log('ID do primeiro documento encontrado:', foundDocument._id);
        } else {
          console.log('Nenhum documento encontrado para o item de pesquisa fornecido.');
        }
      }});

    const itemDonated = new ItemDonated({
      key: key,
      quantidade: quantity,
      nome: name
    });

    Item.updateOne(
      { _id: documentId },
      { $set: { quantidadeDoada: quantity }},
      (err, result) => {
        if (err) {
          console.error(err);
        } else {
          console.log('Documento atualizado com sucesso:', result);
        }});

    await itemDonated.save();
    console.log('Dados enviados para o MongoDB com sucesso!');
    res.status(201).json({ message: 'Dados salvos com sucesso no MongoDB' });
  } catch (error) {
    console.error('Erro ao enviar dados para o MongoDB:', error);
    res.status(500).json({ error: 'Erro ao salvar dados no MongoDB' });
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
