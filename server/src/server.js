const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const router = express.Router();

const User = require("./models/User");

dotenv.config();

mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to MongoDB");
  }
);

//middleware
app.use(express.json());

// CADASTRO DE NOVO USUÁRIO
// 1 - Envio de email com código

async function sendEmailWithCodeAndSaveCode() {
  // Geração de serviço SMTP de teste no ethereal.email
  // Só é necessário caso não tenha uma conta de email real para teste
  let testAccount = await nodemailer.createTestAccount();

  // Criação de um transporter reutilizável usando por padrão SMTP
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true para 465, false para outras portas
    auth: {
      user: testAccount.user, // cria um usuário no ethereal
      pass: testAccount.pass, // cria uma senha no ethereal
    },
  });

  // Envia o email com o objeto transport definido acima
  let info = await transporter.sendMail({
    from: '"John Doe" <johndoe@example.com>',
    to: "bar@example.com",
    subject: "Título do email que aparece na caixa de entrada",
    text: "Código de cadastro - 5555",
    html: "<b>Código de cadastro - 5555 em html</b>",
  });

  console.log("Email enviado: %s", info.messageId);
  // Email enviado: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview do email caso tenha usado o ethereal (não da para ver o preview se for com outros emails)
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

  /*
    async function saveCodeOnDataBase() {
      função para salvar o código enviado por email no banco de dados
    }
  */
}

sendEmailWithCodeAndSaveCode().catch(console.error);

// 2 - Cadastro de usuário com código enviado no email + CPF + senha
app.post("/register", (req, res) => {
  User.find({ cpf: req.body.cpf })
    .then((result) => {
      // IF cpf já existe ou o código não é igual ao código enviado
      if (result.length !== 0) {
        res.json({
          message: "Email already exists",
          status: false,
        });
      } else {
        let userData = req.body;
        let user = new User(userData);
        user._id = new mongoose.Types.ObjectId();

        user
          .save()
          .then((result) => {
            res.json({
              message: "User register success",
              status: true,
              send: userData,
            });
          })
          .catch((error) => {
            res.json({
              message: " User Register fail",
              status: false,
            });
          });
      }
    })
    .catch((error) => {
      res.json({
        message: " User Register fail",
        status: false,
      });
    });
});

// Autenticação - Geração de JWT
// Recebe cpf e senha e estando ok, gera o token;
app.post("/auth", async (req, res) => {
  return res.json({
    token: jwt.sign({ id: "1234" }, "SECRET", {
      expiresIn: "1d",
    }),
  });
});

// Refresh Token
/*
  O que está funcão faz:
  1 - Recebe o token gerado no login
  2 - Verifica se é um token válido
  3 - Caso seja um token válido e ainda dentro da validade,
      gera um novo token válido igual ao token inicialmente gerado no login;

      Caso seja um token válido e tenha expirado, gera um novo token
      válido igual ao token inicialmente gerado no login;

      Caso seja um token inválido, retorna um erro;
*/
app.post("/auth/refresh", async (req, res) => {
  const refresh_token = req.body.token;

  try {
    const decoded = jwt.verify(refresh_token, "SECRET");

    const access_token = await jwt.sign(
      {
        user_id: decoded.id,
      },
      "2d"
    );

    return res.json({
      access_token,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.log("TOKEN_EXPIRED: New JWT generated");

      return res.status(200).json({
        token: jwt.sign({ id: "1234" }, "SECRET", {
          expiresIn: "2d",
        }),
      });
    }

    console.log("ERROR", error);

    return res.status(400).json({ error: "Token inválido" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000!");
});
