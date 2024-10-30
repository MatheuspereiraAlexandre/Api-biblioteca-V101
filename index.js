import express, { urlencoded } from "express";
import session from "express-session";
import mysql2 from "mysql2";
import cors from "cors"

const corsoption = ({
    origin: '*',
    methods: "GET,POST",
    allowedHeaders: 'Content-Type,Authorization'
});


const app = express();
app.use(cors(corsoption));
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.set('trust proxy', 1) 
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}))
// Configuração da conexão usando variáveis de ambiente
const mysqli = mysql2.createConnection({
    host: process.env.MYSQL_HOST || 'autorack.proxy.rlwy.net', // Use o host público
    user: process.env.MYSQL_USER || 'root',                  // Nome de usuário
    password: process.env.MYSQL_PASSWORD || 'bOFQusubmqGomYrgpFNOdjjoWtoLIoGW', // Senha
    database: process.env.MYSQL_DATABASE || 'railway',       // Nome do banco de dados
    port: process.env.MYSQL_PORT || 52578                     // Porta do banco de dados
});

// Testando a conexão
connection.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err.stack);
        return;
    }
    console.log('Conectado ao MySQL como ID ' + connection.threadId);
});


app.post('/cadastro', (req, res) => {
    const { nome, email, senha } = req.body;
    try {
        const slc = "SELECT * FROM usuario WHERE email = ? OR nome = ?";
        mysqli.query(slc, [email, senha], (err, result) => {
            if (err) {
                console.log("erro ao fazer a pesquisa", err)
            }
            if (result.length > 0) {
                console.log("Ja existe um usuario com esse nome", result)
            }
            else {
                const insr = "INSERT INTO usuario(nome, email, senha) VALUES(?,?,?)";
                mysqli.query(insr, [nome, email, senha], (err, result) => {
                    if (err) {
                        console.log("deu erro ao tentar fazer a insercao", err);
                    }
                    console.log("inserido com sucesso");
                    res.redirect('http://127.0.0.1:5500/SITE/Library_Login/login.html')
                })
            }
        })
    }
    catch (err) {
        console.error("deu erro ao tentar conectar ao banco", err);
    }
})

app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    try {
        const slc = "SELECT * FROM usuario WHERE email = ? and senha = ?";
        mysqli.query(slc, [email, senha], (err, result) => {
            if (err) {
                console.log("deu erro ao fazer a pesquisa", err)
            }

            if (result.length > 0) {
                req.session.userData = result[0];
                console.log("login bem sucedido", result);
                res.status(200).redirect('/main')
            }
            else {
                console.log("Email ou senha nao estao errados");
                res.send(`
                    <script>
                        alert("Email ou senha incorretos");
                        window.location.href = "http://127.0.0.1:5500/SITE/Library_Login/login.html"; // Redireciona de volta para a página de login, se necessário
                    </script>
                `);
            }
        })
    }
    catch (err) {
        console.log("erro ao tentar fazer conexao com o banco", err);
    };
});

app.post('/registrar-livro', (req, res) => {
    const { img, pdf, isbn, titulo, descricao, autor, editora, genero, publicacao} = req.body;
    const slc = "SELECT * FROM livros WHERE isbn = ?";
    try{
        mysqli.query(slc, [isbn], (err, result) => {
            if(err){
                console.log("deu erro ao tentar fazer a pesquisa", err);
            }
            if(result.length > 0){
                console.log("ja existe um livro com esse isbn")
            }
            else{
                const insr = "INSERT INTO livros(capa_livro, pdf_livro, isbn, titulo, descricao, autor, editora, genero, publicacao) VALUES(?, ?, ?, ?, ?, ?, ?, ? ,?)"
                mysqli.query(insr, [img, pdf, isbn, titulo, descricao, autor, editora, genero, publicacao], (err, result) => {
                    if(err){
                        console.log("deu erro ao inserir", err)
                    }
                    res.json(result);                  
              
                })
            }
        })
    }
    catch(err){
        console.log('erro ao tentar fazer conexao ao banco', err)
    }
    
})

app.get('/books', (req, res) => {
    const slc = "SELECT * FROM livros";
    mysqli.query(slc, (err, result) => {
        if(err){
            console.log("erro ao fazer a pesquisa")
        }
        if(result.length > 0){
            console.log("tudo certo ao fazer a pesquisa", result);
            res.json(result)
        }
    })
});

app.get('/main', (req, res) => {
    res.redirect('http://127.0.0.1:5500/SITE/Library_Collection/')
})

app.get('/user', (req, res) => {
    res.json({ data: req.session.userData, cookie: req.sessionID })
})

app.listen(3000, () => {
    console.log("servidor rodando na porta 3000")
});