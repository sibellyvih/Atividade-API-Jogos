const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(express.json());

const db = new sqlite3.Database('jogos.db');

db.run(`
CREATE TABLE IF NOT EXISTS jogos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT,
  genero TEXT,
  preco REAL
)
`);

app.get('/jogos', (req, res) => {
  db.all("SELECT * FROM jogos", [], (err, rows) => {
    res.json(rows);
  });
});

app.post('/jogos', (req, res) => {
  const { nome, genero, preco } = req.body;

  db.run(
    "INSERT INTO jogos (nome, genero, preco) VALUES (?, ?, ?)",
    [nome, genero, preco],
    function () {
      res.json({ id: this.lastID });
    }
  );
});

app.delete('/jogos/:id', (req, res) => {
  db.run("DELETE FROM jogos WHERE id=?", [req.params.id], function () {
    res.json({ deletado: true });
  });
});

// PUT (atualizar tudo)
app.put('/jogos/:id', (req, res) => {
  const { nome, genero, preco } = req.body;
  const id = req.params.id;

  db.run(
    "UPDATE jogos SET nome=?, genero=?, preco=? WHERE id=?",
    [nome, genero, preco, id],
    function () {
      if (this.changes === 0) {
        return res.status(404).json({ erro: "Jogo não encontrado" });
      }

      res.json({ mensagem: "Jogo atualizado!" });
    }
  );
});

// PATCH (atualizar parcial)
app.patch('/jogos/:id', (req, res) => {
  const id = req.params.id;
  const { nome, genero, preco } = req.body;

  db.run(
    `UPDATE jogos SET 
      nome = COALESCE(?, nome),
      genero = COALESCE(?, genero),
      preco = COALESCE(?, preco)
    WHERE id = ?`,
    [nome, genero, preco, id],
    function () {
      if (this.changes === 0) {
        return res.status(404).json({ erro: "Jogo não encontrado" });
      }

      res.json({ mensagem: "Atualizado parcialmente!" });
    }
  );
});

app.listen(3000, () => console.log("O querido está rodando..."));