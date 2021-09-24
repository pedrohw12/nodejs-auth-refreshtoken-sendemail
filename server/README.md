# Geração de Token e Refresh Token

## Geração JWT ao fazer login
Ao ser enviado CPF e senha corretos, de um usuário cadastrado,
é gerado um JWT, que representa a autenticação deste usuário


## Geração de Refresh Token
É enviado um JWT e gerado um novo JWT válido a partir deste.
Caso o JWT seja inválido, um erro é retornado.
JWT expirado, mas válido, gera JWT novo também

Cadastro:
1 - Envio de email com um código
2 - Envio do código + email + cpf + senha para realizar cadastro
3 - Caso o código seja errado, não realizar cadastro

## Cadastro de usuário
Cadastrar um novo usuário solicitando o código enviado por email

1 - Envio de email com o código
2 - Cadastro de usuário com o código, email, cpf e senha
3 - Caso o código esteja errado, não cadastra